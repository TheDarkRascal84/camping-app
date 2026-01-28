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

describe("campgrounds.search", () => {
  let testCampgroundId: number;

  beforeAll(async () => {
    // Create a test campground
    testCampgroundId = await db.createCampground({
      externalId: "test-campground-1",
      name: "Test Campground",
      description: "A test campground for vitest",
      latitude: "37.7749",
      longitude: "-122.4194",
      address: "123 Test St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      campgroundType: "mixed",
      managingOrganization: "Test Parks",
      bookingUrl: "https://example.com",
      phoneNumber: "555-0000",
      reservable: true,
      dataSource: "test",
      dataSourceUrl: "https://example.com",
      photos: null,
      lastSyncedAt: new Date(),
    });
  });

  it("should search campgrounds by state", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.search({ state: "CA" });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    const testCampground = result.find(c => c.id === testCampgroundId);
    expect(testCampground).toBeDefined();
    expect(testCampground?.state).toBe("CA");
  });

  it("should search campgrounds by city", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.search({ city: "San Francisco" });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    const testCampground = result.find(c => c.id === testCampgroundId);
    expect(testCampground).toBeDefined();
    expect(testCampground?.city).toContain("San Francisco");
  });

  it("should filter campgrounds by type", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.search({ 
      state: "CA",
      campgroundType: ["mixed"] 
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    const testCampground = result.find(c => c.id === testCampgroundId);
    expect(testCampground).toBeDefined();
    expect(testCampground?.campgroundType).toBe("mixed");
  });

  it("should get campground by ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.getById({ id: testCampgroundId });

    expect(result).toBeDefined();
    expect(result?.id).toBe(testCampgroundId);
    expect(result?.name).toBe("Test Campground");
    expect(result?.state).toBe("CA");
  });

  it("should return empty array for non-existent state", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.search({ state: "ZZ" });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
