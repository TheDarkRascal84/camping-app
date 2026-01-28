/**
 * Base interface for data source adapters
 * All external data sources (RIDB, state parks, private APIs) implement this interface
 */

export interface CampgroundData {
  externalId: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  campgroundType: "tent" | "rv" | "cabin" | "dispersed" | "group" | "mixed";
  managingOrganization?: string;
  bookingUrl?: string;
  phoneNumber?: string;
  reservable: boolean;
  photos?: string[];
  amenities?: string[];
}

export interface SiteData {
  externalId: string;
  siteName: string;
  siteNumber?: string;
  siteType: "tent" | "rv" | "cabin" | "group" | "equestrian" | "boat";
  maxOccupancy?: number;
  maxVehicles?: number;
  rvMaxLength?: number;
  pricePerNight?: number;
  hasWater: boolean;
  hasElectric: boolean;
  hasSewer: boolean;
  hasFireRing: boolean;
  hasPicnicTable: boolean;
  isPetFriendly: boolean;
  isAccessible: boolean;
  amenitiesJson?: Record<string, any>;
}

export interface AvailabilityData {
  siteExternalId: string;
  availableDate: Date;
  status: "available" | "reserved" | "unavailable" | "unknown";
}

export interface DataSourceAdapter {
  name: string;
  type: "api" | "scraper" | "manual";
  
  /**
   * Fetch campgrounds from the data source
   * @param params Search parameters (location, type, etc.)
   * @returns Array of campground data
   */
  fetchCampgrounds(params?: {
    state?: string;
    latitude?: number;
    longitude?: number;
    radiusMiles?: number;
    limit?: number;
  }): Promise<CampgroundData[]>;
  
  /**
   * Fetch sites for a specific campground
   * @param campgroundExternalId External ID of the campground
   * @returns Array of site data
   */
  fetchSites(campgroundExternalId: string): Promise<SiteData[]>;
  
  /**
   * Fetch availability for specific sites
   * @param siteExternalIds Array of site external IDs
   * @param startDate Start date for availability check
   * @param endDate End date for availability check
   * @returns Array of availability data
   */
  fetchAvailability(
    siteExternalIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilityData[]>;
  
  /**
   * Check if the adapter is currently available
   * @returns true if the adapter can be used
   */
  isAvailable(): Promise<boolean>;
}
