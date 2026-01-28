import { DataSourceAdapter, CampgroundData, SiteData, AvailabilityData } from "./base";

/**
 * Mock Adapter for demonstration and testing
 * Generates sample campground data for states without RIDB coverage
 */
export class MockAdapter implements DataSourceAdapter {
  name: string;
  type: "api" | "scraper" | "manual" = "manual";
  
  constructor(name: string = "mock") {
    this.name = name;
  }
  
  async isAvailable(): Promise<boolean> {
    return true;
  }
  
  async fetchCampgrounds(params?: {
    state?: string;
    latitude?: number;
    longitude?: number;
    radiusMiles?: number;
    limit?: number;
  }): Promise<CampgroundData[]> {
    const limit = params?.limit || 10;
    const state = params?.state || "CA";
    
    const mockCampgrounds: CampgroundData[] = [];
    
    for (let i = 1; i <= Math.min(limit, 10); i++) {
      mockCampgrounds.push({
        externalId: `${this.name}-${state}-${i}`,
        name: `${state} State Park Campground ${i}`,
        description: `Beautiful campground in ${state} with scenic views and modern amenities. Perfect for families and outdoor enthusiasts.`,
        latitude: params?.latitude ? params.latitude + (Math.random() - 0.5) * 0.5 : 37.7749 + (Math.random() - 0.5),
        longitude: params?.longitude ? params.longitude + (Math.random() - 0.5) * 0.5 : -122.4194 + (Math.random() - 0.5),
        address: `${1000 + i * 100} Park Road`,
        city: `City ${i}`,
        state: state,
        zipCode: `9${i.toString().padStart(4, '0')}`,
        campgroundType: this.randomCampgroundType(),
        managingOrganization: `${state} State Parks`,
        bookingUrl: `https://example.com/campground/${this.name}-${state}-${i}`,
        phoneNumber: `555-${i.toString().padStart(3, '0')}-0000`,
        reservable: true,
        photos: [],
        amenities: ["Restrooms", "Showers", "Picnic Areas", "Hiking Trails"],
      });
    }
    
    return mockCampgrounds;
  }
  
  private randomCampgroundType(): CampgroundData["campgroundType"] {
    const types: CampgroundData["campgroundType"][] = ["tent", "rv", "cabin", "mixed"];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  async fetchSites(campgroundExternalId: string): Promise<SiteData[]> {
    const numSites = 15 + Math.floor(Math.random() * 35); // 15-50 sites
    const sites: SiteData[] = [];
    
    for (let i = 1; i <= numSites; i++) {
      sites.push({
        externalId: `${campgroundExternalId}-site-${i}`,
        siteName: `Site ${i}`,
        siteNumber: i.toString(),
        siteType: this.randomSiteType(),
        maxOccupancy: 2 + Math.floor(Math.random() * 6), // 2-8 people
        maxVehicles: 1 + Math.floor(Math.random() * 2), // 1-2 vehicles
        rvMaxLength: Math.random() > 0.5 ? 20 + Math.floor(Math.random() * 25) : undefined, // 20-45 feet
        pricePerNight: 20 + Math.floor(Math.random() * 60), // $20-$80
        hasWater: Math.random() > 0.4,
        hasElectric: Math.random() > 0.5,
        hasSewer: Math.random() > 0.7,
        hasFireRing: Math.random() > 0.2,
        hasPicnicTable: Math.random() > 0.1,
        isPetFriendly: Math.random() > 0.3,
        isAccessible: Math.random() > 0.8,
        amenitiesJson: {},
      });
    }
    
    return sites;
  }
  
  private randomSiteType(): SiteData["siteType"] {
    const types: SiteData["siteType"][] = ["tent", "rv", "cabin", "group"];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  async fetchAvailability(
    siteExternalIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilityData[]> {
    const results: AvailabilityData[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      for (const siteId of siteExternalIds) {
        // Random availability with 60% available, 30% reserved, 10% unavailable
        const rand = Math.random();
        let status: AvailabilityData["status"];
        if (rand < 0.6) {
          status = "available";
        } else if (rand < 0.9) {
          status = "reserved";
        } else {
          status = "unavailable";
        }
        
        results.push({
          siteExternalId: siteId,
          availableDate: new Date(currentDate),
          status,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return results;
  }
}
