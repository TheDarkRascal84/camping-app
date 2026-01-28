import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import { getDb } from "./db";
import { campgrounds } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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

describe("image caching", () => {
  let testCampgroundId: number;

  beforeAll(async () => {
    // Create a test campground
    testCampgroundId = await db.createCampground({
      externalId: "test-image-cache-1",
      name: "Cache Test Campground",
      description: "Testing image caching",
      latitude: "37.7749",
      longitude: "-122.4194",
      address: "123 Cache St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      campgroundType: "tent",
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

  it("should fetch and cache images on first request", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First request - should fetch from API and cache
    const result1 = await caller.images.getCampgroundImages({
      campgroundName: "Cache Test Campground",
      city: "San Francisco",
      state: "CA",
      campgroundType: "tent",
      limit: 3,
      campgroundId: testCampgroundId,
    });

    expect(result1).toBeDefined();
    expect(Array.isArray(result1)).toBe(true);
    expect(result1.length).toBeGreaterThan(0);

    // Verify images were cached in database
    const database = await getDb();
    if (database) {
      const cached = await database
        .select({ photos: campgrounds.photos })
        .from(campgrounds)
        .where(eq(campgrounds.id, testCampgroundId))
        .limit(1);

      expect(cached).toBeDefined();
      expect(cached.length).toBe(1);
      expect(cached[0].photos).not.toBeNull();
      expect(Array.isArray(cached[0].photos)).toBe(true);
    }
  });

  it("should use cached images on subsequent requests", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Second request - should use cache
    const result2 = await caller.images.getCampgroundImages({
      campgroundName: "Cache Test Campground",
      city: "San Francisco",
      state: "CA",
      campgroundType: "tent",
      limit: 3,
      campgroundId: testCampgroundId,
    });

    expect(result2).toBeDefined();
    expect(Array.isArray(result2)).toBe(true);
    expect(result2.length).toBeGreaterThan(0);

    // Verify structure of cached images
    result2.forEach((img) => {
      expect(img).toHaveProperty("url");
      expect(img).toHaveProperty("thumbnail");
      expect(img).toHaveProperty("alt");
      expect(img).toHaveProperty("credit");
    });
  });

  it("should respect limit parameter when retrieving cached images", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Request with limit of 1
    const result = await caller.images.getCampgroundImages({
      campgroundName: "Cache Test Campground",
      city: "San Francisco",
      state: "CA",
      campgroundType: "tent",
      limit: 1,
      campgroundId: testCampgroundId,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it("should fetch new images if campgroundId is not provided", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Request without campgroundId - should not use cache
    const result = await caller.images.getCampgroundImages({
      campgroundName: "No Cache Campground",
      city: "Denver",
      state: "CO",
      campgroundType: "rv",
      limit: 2,
      // No campgroundId provided
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
