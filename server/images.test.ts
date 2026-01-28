import { describe, expect, it } from "vitest";
import { fetchCampgroundImages } from "./images";

describe("images", () => {
  it("should return placeholder images when UNSPLASH_ACCESS_KEY is not set", async () => {
    const result = await fetchCampgroundImages({
      campgroundName: "Test Campground",
      city: "San Francisco",
      state: "CA",
      campgroundType: "tent",
      limit: 3,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
    
    result.forEach((image) => {
      expect(image).toHaveProperty("url");
      expect(image).toHaveProperty("thumbnail");
      expect(image).toHaveProperty("alt");
      expect(image).toHaveProperty("credit");
      expect(image.url).toContain("picsum.photos");
      expect(image.thumbnail).toContain("picsum.photos");
    });
  });

  it("should generate unique placeholder images for different campgrounds", async () => {
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

    expect(result1[0].url).not.toBe(result2[0].url);
  });

  it("should respect the limit parameter", async () => {
    const result = await fetchCampgroundImages({
      campgroundName: "Test Campground",
      city: "Denver",
      state: "CO",
      campgroundType: "cabin",
      limit: 5,
    });

    expect(result.length).toBe(5);
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

    expect(result[0].alt).toContain(campgroundName);
  });
});
