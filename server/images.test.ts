import { describe, expect, it } from "vitest";
import { fetchCampgroundImages } from "./images";

describe("images", () => {
  it("should return images with correct structure", async () => {
    const result = await fetchCampgroundImages({
      campgroundName: "Test Campground",
      city: "San Francisco",
      state: "CA",
      campgroundType: "tent",
      limit: 3,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // Should return at least one image, up to the requested limit
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(3);
    
    result.forEach((image) => {
      expect(image).toHaveProperty("url");
      expect(image).toHaveProperty("thumbnail");
      expect(image).toHaveProperty("alt");
      expect(image).toHaveProperty("credit");
      // URL should be from Unsplash or picsum (depending on API key)
      expect(image.url.length).toBeGreaterThan(0);
    });
  });

  it("should return images for different campgrounds", async () => {
    const result1 = await fetchCampgroundImages({
      campgroundName: "Campground A",
      city: "Los Angeles",
      state: "CA",
      campgroundType: "rv",
      limit: 1,
    });

    const result2 = await fetchCampgroundImages({
      campgroundName: "Campground B",
      city: "San Diego",
      state: "CA",
      campgroundType: "tent",
      limit: 1,
    });

    // Both should return at least one image
    expect(result1.length).toBeGreaterThan(0);
    expect(result2.length).toBeGreaterThan(0);
    expect(result1[0]).toHaveProperty("url");
    expect(result2[0]).toHaveProperty("url");
  });

  it("should respect the limit parameter", async () => {
    const result = await fetchCampgroundImages({
      campgroundName: "Test Campground",
      city: "Denver",
      state: "CO",
      campgroundType: "cabin",
      limit: 5,
    });

    // Should return up to the requested limit (may be less if API returns fewer results)
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("should include descriptive alt text", async () => {
    const campgroundName = "Beautiful Mountain Camp";
    const result = await fetchCampgroundImages({
      campgroundName,
      city: "Boulder",
      state: "CO",
      campgroundType: "tent",
      limit: 1,
    });

    // Alt text should exist and be descriptive
    expect(result[0].alt).toBeDefined();
    expect(result[0].alt.length).toBeGreaterThan(0);
    // With real Unsplash API, alt text comes from the photo, not campground name
    // With placeholders, it includes the campground name
    if (process.env.UNSPLASH_ACCESS_KEY) {
      expect(typeof result[0].alt).toBe("string");
    } else {
      expect(result[0].alt).toContain(campgroundName);
    }
  });
});
