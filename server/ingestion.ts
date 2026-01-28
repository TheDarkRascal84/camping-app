import { DataSourceAdapter, CampgroundData, SiteData } from "./adapters/base";
import { RIDBAdapter } from "./adapters/ridb";
import { MockAdapter } from "./adapters/mock";
import * as db from "./db";

/**
 * In-memory cache for campground and site data
 * In production, this should be replaced with Redis or similar
 */
class SimpleCache {
  private cache = new Map<string, { data: any; expiresAt: number }>();
  
  set(key: string, data: any, ttlSeconds: number = 3600) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();

/**
 * Data Ingestion Service
 * Manages multiple data source adapters and coordinates data synchronization
 */
export class IngestionService {
  private adapters: Map<string, DataSourceAdapter> = new Map();
  
  constructor() {
    // Initialize adapters
    // Note: RIDB API key should be provided via environment variable
    const ridbApiKey = process.env.RIDB_API_KEY;
    this.adapters.set("ridb", new RIDBAdapter(ridbApiKey));
    this.adapters.set("state_parks", new MockAdapter("state_parks"));
    this.adapters.set("private", new MockAdapter("private"));
  }
  
  getAdapter(name: string): DataSourceAdapter | null {
    return this.adapters.get(name) || null;
  }
  
  getAllAdapters(): DataSourceAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  /**
   * Sync campgrounds from a specific data source
   */
  async syncCampgrounds(
    adapterName: string,
    params?: {
      state?: string;
      latitude?: number;
      longitude?: number;
      radiusMiles?: number;
      limit?: number;
    }
  ): Promise<number> {
    const adapter = this.adapters.get(adapterName);
    if (!adapter) {
      throw new Error(`Adapter ${adapterName} not found`);
    }
    
    console.log(`[Ingestion] Syncing campgrounds from ${adapterName}...`);
    
    try {
      const campgroundsData = await adapter.fetchCampgrounds(params);
      let syncedCount = 0;
      
      for (const campgroundData of campgroundsData) {
        await this.saveCampground(campgroundData, adapterName);
        syncedCount++;
      }
      
      console.log(`[Ingestion] Synced ${syncedCount} campgrounds from ${adapterName}`);
      
      // Update data source status
      const dataSource = await db.getDataSourceByName(adapterName);
      if (dataSource) {
        await db.updateDataSourceStatus(dataSource.id, new Date());
      }
      
      return syncedCount;
    } catch (error) {
      console.error(`[Ingestion] Failed to sync campgrounds from ${adapterName}:`, error);
      
      // Update data source with error
      const dataSource = await db.getDataSourceByName(adapterName);
      if (dataSource) {
        await db.updateDataSourceStatus(dataSource.id, undefined, (error as Error).message);
      }
      
      throw error;
    }
  }
  
  /**
   * Sync sites for a specific campground
   */
  async syncSites(campgroundId: number): Promise<number> {
    const campground = await db.getCampgroundById(campgroundId);
    if (!campground || !campground.externalId) {
      throw new Error(`Campground ${campgroundId} not found or missing external ID`);
    }
    
    const adapter = this.adapters.get(campground.dataSource);
    if (!adapter) {
      throw new Error(`Adapter ${campground.dataSource} not found`);
    }
    
    console.log(`[Ingestion] Syncing sites for campground ${campground.name}...`);
    
    try {
      const sitesData = await adapter.fetchSites(campground.externalId);
      let syncedCount = 0;
      
      for (const siteData of sitesData) {
        await this.saveSite(siteData, campgroundId);
        syncedCount++;
      }
      
      console.log(`[Ingestion] Synced ${syncedCount} sites for campground ${campground.name}`);
      
      return syncedCount;
    } catch (error) {
      console.error(`[Ingestion] Failed to sync sites for campground ${campgroundId}:`, error);
      throw error;
    }
  }
  
  /**
   * Sync availability for sites
   */
  async syncAvailability(
    campgroundId: number,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const campground = await db.getCampgroundById(campgroundId);
    if (!campground) {
      throw new Error(`Campground ${campgroundId} not found`);
    }
    
    const sites = await db.getSitesByCampgroundId(campgroundId);
    if (sites.length === 0) {
      console.log(`[Ingestion] No sites found for campground ${campgroundId}`);
      return 0;
    }
    
    const adapter = this.adapters.get(campground.dataSource);
    if (!adapter) {
      throw new Error(`Adapter ${campground.dataSource} not found`);
    }
    
    console.log(`[Ingestion] Syncing availability for ${sites.length} sites...`);
    
    try {
      const siteExternalIds = sites
        .map(s => s.externalId)
        .filter((id): id is string => id !== null);
      
      const availabilityData = await adapter.fetchAvailability(
        siteExternalIds,
        startDate,
        endDate
      );
      
      // Map external IDs to internal site IDs
      const externalIdToSiteId = new Map(
        sites.map(s => [s.externalId, s.id])
      );
      
      const availabilityRecords = availabilityData
        .map(avail => {
          const siteId = externalIdToSiteId.get(avail.siteExternalId);
          if (!siteId) return null;
          
          return {
            siteId,
            availableDate: avail.availableDate,
            status: avail.status,
            checkedAt: new Date(),
          };
        })
        .filter((record): record is NonNullable<typeof record> => record !== null);
      
      await db.bulkUpsertAvailability(availabilityRecords);
      
      console.log(`[Ingestion] Synced ${availabilityRecords.length} availability records`);
      
      return availabilityRecords.length;
    } catch (error) {
      console.error(`[Ingestion] Failed to sync availability for campground ${campgroundId}:`, error);
      throw error;
    }
  }
  
  /**
   * Save campground data to database
   */
  private async saveCampground(data: CampgroundData, dataSource: string): Promise<number> {
    // Check if campground already exists
    const existing = await db.getCampgroundByExternalId(data.externalId, dataSource);
    
    const campgroundData = {
      externalId: data.externalId,
      name: data.name,
      description: data.description || null,
      latitude: data.latitude?.toString() || null,
      longitude: data.longitude?.toString() || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zipCode: data.zipCode || null,
      campgroundType: data.campgroundType,
      managingOrganization: data.managingOrganization || null,
      bookingUrl: data.bookingUrl || null,
      phoneNumber: data.phoneNumber || null,
      reservable: data.reservable,
      dataSource,
      dataSourceUrl: data.bookingUrl || null,
      photos: data.photos || null,
      lastSyncedAt: new Date(),
    };
    
    if (existing) {
      await db.updateCampground(existing.id, campgroundData);
      return existing.id;
    } else {
      return await db.createCampground(campgroundData);
    }
  }
  
  /**
   * Save site data to database
   */
  private async saveSite(data: SiteData, campgroundId: number): Promise<number> {
    const siteData = {
      campgroundId,
      externalId: data.externalId,
      siteName: data.siteName,
      siteNumber: data.siteNumber || null,
      siteType: data.siteType,
      maxOccupancy: data.maxOccupancy || null,
      maxVehicles: data.maxVehicles || null,
      rvMaxLength: data.rvMaxLength || null,
      pricePerNight: data.pricePerNight?.toString() || null,
      currency: "USD",
      hasWater: data.hasWater,
      hasElectric: data.hasElectric,
      hasSewer: data.hasSewer,
      hasFireRing: data.hasFireRing,
      hasPicnicTable: data.hasPicnicTable,
      isPetFriendly: data.isPetFriendly,
      isAccessible: data.isAccessible,
      amenitiesJson: data.amenitiesJson || null,
    };
    
    return await db.createSite(siteData);
  }
}

// Singleton instance
export const ingestionService = new IngestionService();
