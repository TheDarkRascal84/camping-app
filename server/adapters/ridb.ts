import axios from "axios";
import { DataSourceAdapter, CampgroundData, SiteData, AvailabilityData } from "./base";

/**
 * RIDB (Recreation Information Database) Adapter
 * Connects to Recreation.gov API to fetch federal campground data
 */
export class RIDBAdapter implements DataSourceAdapter {
  name = "ridb";
  type: "api" | "scraper" | "manual" = "api";
  
  private baseUrl = "https://ridb.recreation.gov/api/v1";
  private apiKey: string | null = null;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/organizations`, {
        headers: this.getHeaders(),
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error("[RIDB] Availability check failed:", error);
      return false;
    }
  }
  
  private getHeaders() {
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };
    if (this.apiKey) {
      headers["apikey"] = this.apiKey;
    }
    return headers;
  }
  
  async fetchCampgrounds(params?: {
    state?: string;
    latitude?: number;
    longitude?: number;
    radiusMiles?: number;
    limit?: number;
  }): Promise<CampgroundData[]> {
    try {
      const queryParams: Record<string, any> = {
        limit: params?.limit || 50,
        offset: 0,
      };
      
      if (params?.state) {
        queryParams.state = params.state;
      }
      
      if (params?.latitude && params?.longitude && params?.radiusMiles) {
        queryParams.latitude = params.latitude;
        queryParams.longitude = params.longitude;
        queryParams.radius = params.radiusMiles;
      }
      
      const response = await axios.get(`${this.baseUrl}/facilities`, {
        headers: this.getHeaders(),
        params: queryParams,
        timeout: 30000,
      });
      
      const facilities = response.data.RECDATA || [];
      
      return facilities.map((facility: any) => this.normalizeCampground(facility));
    } catch (error) {
      console.error("[RIDB] Failed to fetch campgrounds:", error);
      return [];
    }
  }
  
  private normalizeCampground(facility: any): CampgroundData {
    return {
      externalId: facility.FacilityID?.toString() || "",
      name: facility.FacilityName || "Unknown Campground",
      description: facility.FacilityDescription || "",
      latitude: facility.FacilityLatitude ? parseFloat(facility.FacilityLatitude) : undefined,
      longitude: facility.FacilityLongitude ? parseFloat(facility.FacilityLongitude) : undefined,
      address: [
        facility.FacilityStreetAddress1,
        facility.FacilityStreetAddress2,
        facility.FacilityStreetAddress3
      ].filter(Boolean).join(", "),
      city: facility.FacilityCity || "",
      state: facility.FacilityStateCode || "",
      zipCode: facility.FacilityZIPCode || "",
      campgroundType: this.determineCampgroundType(facility),
      managingOrganization: facility.OrgName || "",
      bookingUrl: facility.FacilityReservationURL || `https://www.recreation.gov/camping/campgrounds/${facility.FacilityID}`,
      phoneNumber: facility.FacilityPhone || "",
      reservable: facility.Reservable === "true" || facility.Reservable === true,
      photos: [],
      amenities: [],
    };
  }
  
  private determineCampgroundType(facility: any): CampgroundData["campgroundType"] {
    const name = (facility.FacilityName || "").toLowerCase();
    const description = (facility.FacilityDescription || "").toLowerCase();
    const combined = name + " " + description;
    
    if (combined.includes("cabin") || combined.includes("lodge")) {
      return "cabin";
    }
    if (combined.includes("rv") || combined.includes("trailer")) {
      return "rv";
    }
    if (combined.includes("dispersed") || combined.includes("primitive")) {
      return "dispersed";
    }
    if (combined.includes("group")) {
      return "group";
    }
    
    return "mixed";
  }
  
  async fetchSites(campgroundExternalId: string): Promise<SiteData[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/facilities/${campgroundExternalId}/campsites`,
        {
          headers: this.getHeaders(),
          params: { limit: 500 },
          timeout: 30000,
        }
      );
      
      const campsites = response.data.RECDATA || [];
      
      return campsites.map((campsite: any) => this.normalizeSite(campsite));
    } catch (error) {
      console.error(`[RIDB] Failed to fetch sites for campground ${campgroundExternalId}:`, error);
      return [];
    }
  }
  
  private normalizeSite(campsite: any): SiteData {
    const attributes = campsite.ATTRIBUTES || [];
    
    return {
      externalId: campsite.CampsiteID?.toString() || "",
      siteName: campsite.CampsiteName || "Unknown Site",
      siteNumber: campsite.CampsiteID?.toString(),
      siteType: this.determineSiteType(campsite),
      maxOccupancy: this.extractAttribute(attributes, "Max Num of People"),
      maxVehicles: this.extractAttribute(attributes, "Max Num of Vehicles"),
      rvMaxLength: this.extractAttribute(attributes, "Max Vehicle Length"),
      pricePerNight: campsite.CampsiteFee ? parseFloat(campsite.CampsiteFee) : undefined,
      hasWater: this.hasAttribute(attributes, "Water Hookup"),
      hasElectric: this.hasAttribute(attributes, "Electric Hookup") || this.hasAttribute(attributes, "Electricity"),
      hasSewer: this.hasAttribute(attributes, "Sewer Hookup"),
      hasFireRing: this.hasAttribute(attributes, "Campfire Allowed") || this.hasAttribute(attributes, "Fire Ring"),
      hasPicnicTable: this.hasAttribute(attributes, "Picnic Table"),
      isPetFriendly: this.hasAttribute(attributes, "Pets Allowed"),
      isAccessible: this.hasAttribute(attributes, "Accessible"),
      amenitiesJson: { attributes },
    };
  }
  
  private determineSiteType(campsite: any): SiteData["siteType"] {
    const type = (campsite.CampsiteType || "").toLowerCase();
    const name = (campsite.CampsiteName || "").toLowerCase();
    
    if (type.includes("cabin") || name.includes("cabin")) return "cabin";
    if (type.includes("rv") || type.includes("trailer")) return "rv";
    if (type.includes("group")) return "group";
    if (type.includes("equestrian") || type.includes("horse")) return "equestrian";
    if (type.includes("boat")) return "boat";
    
    return "tent";
  }
  
  private extractAttribute(attributes: any[], attributeName: string): number | undefined {
    const attr = attributes.find((a: any) => 
      a.AttributeName?.toLowerCase().includes(attributeName.toLowerCase())
    );
    if (attr && attr.AttributeValue) {
      const value = parseInt(attr.AttributeValue);
      return isNaN(value) ? undefined : value;
    }
    return undefined;
  }
  
  private hasAttribute(attributes: any[], attributeName: string): boolean {
    const attr = attributes.find((a: any) => 
      a.AttributeName?.toLowerCase().includes(attributeName.toLowerCase())
    );
    if (!attr) return false;
    
    const value = attr.AttributeValue?.toLowerCase();
    return value === "yes" || value === "true" || value === "y";
  }
  
  async fetchAvailability(
    siteExternalIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilityData[]> {
    // Note: RIDB API doesn't provide direct availability endpoint
    // This would need to be implemented via Recreation.gov availability API
    // or web scraping, which requires different authentication
    
    console.warn("[RIDB] Availability fetching not implemented - requires Recreation.gov availability API");
    
    // Return unknown status for all dates
    const results: AvailabilityData[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      for (const siteId of siteExternalIds) {
        results.push({
          siteExternalId: siteId,
          availableDate: new Date(currentDate),
          status: "unknown",
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return results;
  }
}
