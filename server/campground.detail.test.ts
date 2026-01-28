import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

function createTestContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("campground.detail", () => {
  let testCampgroundId: number;
  let testSiteId: number;

  beforeAll(async () => {
    // Create a test campground
    testCampgroundId = await db.createCampground({
      externalId: "test-detail-campground",
      name: "Test Detail Campground",
      description: "A campground for testing detail view",
      latitude: "40.7128",
      longitude: "-74.0060",
      address: "456 Test Ave",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      campgroundType: "tent",
      managingOrganization: "Test Parks Department",
      bookingUrl: "https://example.com/book",
      phoneNumber: "555-1234",
      reservable: true,
      dataSource: "test",
      dataSourceUrl: "https://example.com",
      photos: null,
      lastSyncedAt: new Date(),
    });

    // Create a test site
    testSiteId = await db.createSite({
      campgroundId: testCampgroundId,
      externalId: "test-site-1",
      siteName: "Test Site 1",
      siteNumber: "A1",
      siteType: "tent",
      maxOccupancy: 4,
      maxVehicles: 2,
      rvMaxLength: null,
      pricePerNight: "25.00",
      currency: "USD",
      hasWater: true,
      hasElectric: false,
      hasSewer: false,
      hasFireRing: true,
      hasPicnicTable: true,
      isPetFriendly: true,
      isAccessible: false,
      amenitiesJson: null,
    });
  });

  it("should get campground by ID with all details", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.getById({ id: testCampgroundId });

    expect(result).toBeDefined();
    expect(result?.id).toBe(testCampgroundId);
    expect(result?.name).toBe("Test Detail Campground");
    expect(result?.city).toBe("New York");
    expect(result?.state).toBe("NY");
    expect(result?.campgroundType).toBe("tent");
    expect(result?.managingOrganization).toBe("Test Parks Department");
  });

  it("should get sites for a campground", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.getSites({ campgroundId: testCampgroundId });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    const testSite = result.find(s => s.id === testSiteId);
    expect(testSite).toBeDefined();
    expect(testSite?.siteName).toBe("Test Site 1");
    expect(testSite?.siteType).toBe("tent");
    expect(testSite?.hasWater).toBe(true);
    expect(testSite?.isPetFriendly).toBe(true);
  });

  it("should filter sites by amenities", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sites.filter({
      campgroundId: testCampgroundId,
      hasWater: true,
      isPetFriendly: true,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    const testSite = result.find(s => s.id === testSiteId);
    expect(testSite).toBeDefined();
    expect(testSite?.hasWater).toBe(true);
    expect(testSite?.isPetFriendly).toBe(true);
  });

  it("should filter sites by type", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sites.filter({
      campgroundId: testCampgroundId,
      siteType: ["tent"],
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    result.forEach(site => {
      expect(site.siteType).toBe("tent");
    });
  });

  it("should return null for non-existent campground", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.getById({ id: 999999 });

    expect(result).toBeNull();
  });

  it("should return empty array for campground with no sites", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create campground without sites
    const emptyCampgroundId = await db.createCampground({
      externalId: "empty-campground",
      name: "Empty Campground",
      description: null,
      latitude: "35.0",
      longitude: "-120.0",
      address: null,
      city: "Test City",
      state: "CA",
      zipCode: null,
      campgroundType: "mixed",
      managingOrganization: null,
      bookingUrl: null,
      phoneNumber: null,
      reservable: false,
      dataSource: "test",
      dataSourceUrl: null,
      photos: null,
      lastSyncedAt: new Date(),
    });

    const result = await caller.campgrounds.getSites({ campgroundId: emptyCampgroundId });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
