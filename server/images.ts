/**
 * Image service for fetching stock photos of campgrounds
 * Uses Unsplash API for high-quality nature and camping images
 * Implements database caching to reduce API calls
 */

import { getDb } from './db';
import { campgrounds } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

/**
 * Fetch stock images for a campground based on location and type
 * Uses Unsplash API with search queries tailored to campground characteristics
 */
export async function fetchCampgroundImages(params: {
  campgroundName: string;
  city: string;
  state: string;
  campgroundType: string;
  limit?: number;
  campgroundId?: number; // Optional campground ID for caching
}): Promise<{ url: string; thumbnail: string; alt: string; credit: string }[]> {
  const { campgroundName, city, state, campgroundType, limit = 3, campgroundId } = params;

  // Check database cache first if campgroundId is provided
  if (campgroundId) {
    const cachedImages = await getCachedImages(campgroundId, limit);
    if (cachedImages && cachedImages.length > 0) {
      console.log(`[Images] Using cached images for campground ${campgroundId}`);
      return cachedImages;
    }
  }

  // Build search query based on campground characteristics
  const searchTerms = [];
  
  // Add type-specific terms with more detailed keywords
  if (campgroundType === 'tent') {
    searchTerms.push('tent', 'camping', 'campsite', 'campfire');
  } else if (campgroundType === 'rv') {
    searchTerms.push('RV', 'camper', 'motorhome', 'campground');
  } else if (campgroundType === 'cabin') {
    searchTerms.push('cabin', 'log cabin', 'mountain cabin', 'forest');
  } else if (campgroundType === 'dispersed') {
    searchTerms.push('wilderness', 'backcountry', 'camping', 'remote');
  } else {
    searchTerms.push('campground', 'camping', 'outdoor');
  }
  
  // Add state-specific natural features for better relevance
  const stateKeywords: Record<string, string[]> = {
    'california': ['mountains', 'redwoods', 'sierra'],
    'colorado': ['mountains', 'rocky mountains', 'alpine'],
    'oregon': ['forest', 'coast', 'cascade'],
    'washington': ['forest', 'mountains', 'pacific northwest'],
    'arizona': ['desert', 'canyon', 'southwest'],
    'utah': ['desert', 'canyon', 'red rocks'],
    'montana': ['mountains', 'wilderness', 'glacier'],
    'wyoming': ['mountains', 'yellowstone', 'wilderness'],
  };
  
  const stateLower = state.toLowerCase();
  if (stateKeywords[stateLower]) {
    searchTerms.push(...stateKeywords[stateLower]);
  } else {
    searchTerms.push(stateLower);
  }
  
  // Limit to most relevant terms (Unsplash works better with focused queries)
  const query = searchTerms.slice(0, 5).join(' ');

  try {
    // Unsplash API endpoint
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!unsplashAccessKey) {
      console.warn('[Images] UNSPLASH_ACCESS_KEY not configured, returning placeholder images');
      return generatePlaceholderImages(campgroundName, limit);
    }

    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', query);
    url.searchParams.set('per_page', limit.toString());
    url.searchParams.set('orientation', 'landscape');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${unsplashAccessKey}`,
      },
    });

    if (!response.ok) {
      console.error('[Images] Unsplash API error:', response.status, response.statusText);
      return generatePlaceholderImages(campgroundName, limit);
    }

    const data: UnsplashSearchResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn('[Images] No images found for query:', query);
      return generatePlaceholderImages(campgroundName, limit);
    }

    const images = data.results.map((photo) => ({
      url: photo.urls.regular,
      thumbnail: photo.urls.small,
      alt: photo.alt_description || photo.description || `${campgroundName} camping`,
      credit: `Photo by ${photo.user.name} on Unsplash`,
    }));

    // Cache images in database if campgroundId is provided
    if (campgroundId && images.length > 0) {
      await cacheImages(campgroundId, images);
    }

    return images;
  } catch (error) {
    console.error('[Images] Error fetching images:', error);
    return generatePlaceholderImages(campgroundName, limit);
  }
}

/**
 * Generate placeholder images when API is unavailable or returns no results
 * Uses picsum.photos for random nature images
 */
function generatePlaceholderImages(
  campgroundName: string,
  count: number
): { url: string; thumbnail: string; alt: string; credit: string }[] {
  const images = [];
  
  for (let i = 0; i < count; i++) {
    const seed = `${campgroundName}-${i}`.replace(/\s+/g, '-').toLowerCase();
    images.push({
      url: `https://picsum.photos/seed/${seed}/800/600`,
      thumbnail: `https://picsum.photos/seed/${seed}/400/300`,
      alt: `${campgroundName} camping area`,
      credit: 'Placeholder image from Lorem Picsum',
    });
  }
  
  return images;
}

/**
 * Get cached images from database
 */
async function getCachedImages(
  campgroundId: number,
  limit: number
): Promise<{ url: string; thumbnail: string; alt: string; credit: string }[] | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select({ photos: campgrounds.photos })
      .from(campgrounds)
      .where(eq(campgrounds.id, campgroundId))
      .limit(1);

    if (!result || result.length === 0 || !result[0].photos) {
      return null;
    }

    const photos = result[0].photos as any[];
    return photos.slice(0, limit);
  } catch (error) {
    console.error('[Images] Error retrieving cached images:', error);
    return null;
  }
}

/**
 * Cache images in database
 */
async function cacheImages(
  campgroundId: number,
  images: { url: string; thumbnail: string; alt: string; credit: string }[]
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    await db
      .update(campgrounds)
      .set({ photos: images as any })
      .where(eq(campgrounds.id, campgroundId));

    console.log(`[Images] Cached ${images.length} images for campground ${campgroundId}`);
  } catch (error) {
    console.error('[Images] Error caching images:', error);
  }
}
