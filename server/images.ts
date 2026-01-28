/**
 * Image service for fetching stock photos of campgrounds
 * Uses Unsplash API for high-quality nature and camping images
 */

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
}): Promise<{ url: string; thumbnail: string; alt: string; credit: string }[]> {
  const { campgroundName, city, state, campgroundType, limit = 3 } = params;

  // Build search query based on campground characteristics
  const searchTerms = [];
  
  // Add type-specific terms
  if (campgroundType === 'tent') {
    searchTerms.push('tent camping');
  } else if (campgroundType === 'rv') {
    searchTerms.push('RV camping');
  } else if (campgroundType === 'cabin') {
    searchTerms.push('cabin woods');
  } else {
    searchTerms.push('campground');
  }
  
  // Add location context
  searchTerms.push(state.toLowerCase());
  
  // Add nature/outdoor terms
  searchTerms.push('nature', 'outdoor');
  
  const query = searchTerms.join(' ');

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

    return data.results.map((photo) => ({
      url: photo.urls.regular,
      thumbnail: photo.urls.small,
      alt: photo.alt_description || photo.description || `${campgroundName} camping`,
      credit: `Photo by ${photo.user.name} on Unsplash`,
    }));
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
