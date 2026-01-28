import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

describe("Pagination functionality", () => {
  it("should return paginated results with total count", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.search({
      state: "CA",
      limit: 20,
      offset: 0,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("campgrounds");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.campgrounds)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("should respect limit parameter", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.search({
      state: "CA",
      limit: 5,
      offset: 0,
    });

    expect(result.campgrounds.length).toBeLessThanOrEqual(5);
  });

  it("should respect offset parameter", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Get first page
    const firstPage = await caller.campgrounds.search({
      state: "CA",
      limit: 10,
      offset: 0,
    });

    // Get second page
    const secondPage = await caller.campgrounds.search({
      state: "CA",
      limit: 10,
      offset: 10,
    });

    // If there are enough results, the IDs should be different
    if (firstPage.campgrounds.length > 0 && secondPage.campgrounds.length > 0) {
      const firstPageIds = firstPage.campgrounds.map(c => c.id);
      const secondPageIds = secondPage.campgrounds.map(c => c.id);
      
      // No overlap between pages
      const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
      expect(overlap.length).toBe(0);
    }
  });

  it("should return correct total count regardless of pagination", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const firstPage = await caller.campgrounds.search({
      state: "CA",
      limit: 10,
      offset: 0,
    });

    const secondPage = await caller.campgrounds.search({
      state: "CA",
      limit: 10,
      offset: 10,
    });

    // Total should be the same for both queries
    expect(firstPage.total).toBe(secondPage.total);
  });

  it("should handle empty results correctly", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.search({
      state: "ZZ", // Non-existent state
      limit: 20,
      offset: 0,
    });

    expect(result.campgrounds).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("should work with filters and pagination", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campgrounds.search({
      state: "CA",
      campgroundType: ["tent", "mixed"],
      limit: 10,
      offset: 0,
    });

    expect(result).toBeDefined();
    expect(result.campgrounds.length).toBeLessThanOrEqual(10);
    
    // All results should match the filter
    result.campgrounds.forEach(campground => {
      expect(["tent", "mixed"]).toContain(campground.campgroundType);
    });
  });
});
