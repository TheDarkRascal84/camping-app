import { describe, expect, it } from "vitest";
import { fetchCampgroundImages } from "./images";

describe("Unsplash API integration", () => {
  it("should successfully fetch images with valid API key", async () => {
    const images = await fetchCampgroundImages({
      campgroundName: "Test Campground",
      city: "Boulder",
      state: "Colorado",
      campgroundType: "tent",
      limit: 2,
    });

    expect(Array.isArray(images)).toBe(true);
    expect(images.length).toBeGreaterThan(0);
    expect(images.length).toBeLessThanOrEqual(2);

    // Check image structure
    const firstImage = images[0];
    expect(firstImage).toHaveProperty("url");
    expect(firstImage).toHaveProperty("thumbnail");
    expect(firstImage).toHaveProperty("alt");
    expect(firstImage).toHaveProperty("credit");

    // If API key is configured, should get real Unsplash images
    if (process.env.UNSPLASH_ACCESS_KEY) {
      expect(firstImage.url).toContain("images.unsplash.com");
      expect(firstImage.credit).toContain("Unsplash");
    } else {
      // Otherwise should get placeholders
      expect(firstImage.url).toContain("picsum.photos");
      expect(firstImage.credit).toContain("Lorem Picsum");
    }
  }, 10000); // 10 second timeout for API call

  it("should handle different campground types", async () => {
    const types = ["tent", "rv", "cabin", "dispersed"];
    
    for (const type of types) {
      const images = await fetchCampgroundImages({
        campgroundName: "Test Campground",
        city: "Denver",
        state: "Colorado",
        campgroundType: type,
        limit: 1,
      });

      expect(images.length).toBeGreaterThan(0);
      expect(images[0]).toHaveProperty("url");
    }
  }, 15000);

  it("should handle different states with specific keywords", async () => {
    const states = ["California", "Colorado", "Oregon"];
    
    for (const state of states) {
      const images = await fetchCampgroundImages({
        campgroundName: "Test Campground",
        city: "Test City",
        state,
        campgroundType: "tent",
        limit: 1,
      });

      expect(images.length).toBeGreaterThan(0);
      expect(images[0]).toHaveProperty("url");
    }
  }, 15000);
});
