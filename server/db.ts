import { eq, and, gte, lte, inArray, like, sql, or, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, campgrounds, sites, availability, amenities, campgroundAmenities, dataSources, Campground, Site, Availability, Amenity, DataSource } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== CAMPGROUND HELPERS ====================

export async function createCampground(data: typeof campgrounds.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(campgrounds).values(data);
  return result.insertId;
}

export async function getCampgroundById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(campgrounds).where(eq(campgrounds.id, id)).limit(1);
  return result[0] || null;
}

export async function getCampgroundByExternalId(externalId: string, dataSource: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(campgrounds)
    .where(and(
      eq(campgrounds.externalId, externalId),
      eq(campgrounds.dataSource, dataSource)
    ))
    .limit(1);
  return result[0] || null;
}

export async function searchCampgrounds(params: {
  state?: string;
  city?: string;
  campgroundType?: string[];
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { campgrounds: [], total: 0 };
  
  const conditions = [];
  
  if (params.state) {
    conditions.push(eq(campgrounds.state, params.state));
  }
  
  if (params.city) {
    conditions.push(like(campgrounds.city, `%${params.city}%`));
  }
  
  if (params.campgroundType && params.campgroundType.length > 0) {
    conditions.push(inArray(campgrounds.campgroundType, params.campgroundType as any));
  }
  
  // Radius search using Haversine formula
  if (params.latitude && params.longitude && params.radiusMiles) {
    const radiusKm = params.radiusMiles * 1.60934;
    conditions.push(
      sql`(6371 * acos(cos(radians(${params.latitude})) * cos(radians(${campgrounds.latitude})) * cos(radians(${campgrounds.longitude}) - radians(${params.longitude})) + sin(radians(${params.latitude})) * sin(radians(${campgrounds.latitude})))) <= ${radiusKm}`
    );
  }
  
  // Build base query for both count and data
  let baseQuery = db.select().from(campgrounds);
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }
  
  // Get total count
  const countQuery = db.select({ count: sql<number>`count(*)` }).from(campgrounds);
  const countQueryWithConditions = conditions.length > 0 
    ? countQuery.where(and(...conditions))
    : countQuery;
  const [{ count: total }] = await countQueryWithConditions;
  
  // Get paginated results
  const dataQuery = baseQuery.limit(params.limit || 50).offset(params.offset || 0) as any;
  const results = await dataQuery;
  
  return { campgrounds: results, total };
}

export async function updateCampground(id: number, data: Partial<typeof campgrounds.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(campgrounds).set(data).where(eq(campgrounds.id, id));
}

// ==================== SITE HELPERS ====================

export async function createSite(data: typeof sites.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(sites).values(data);
  return result.insertId;
}

export async function getSiteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(sites).where(eq(sites.id, id)).limit(1);
  return result[0] || null;
}

export async function getSitesByCampgroundId(campgroundId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sites).where(eq(sites.campgroundId, campgroundId));
}

export async function filterSites(params: {
  campgroundId?: number;
  siteType?: string[];
  minOccupancy?: number;
  hasWater?: boolean;
  hasElectric?: boolean;
  hasSewer?: boolean;
  isPetFriendly?: boolean;
  isAccessible?: boolean;
  minRvLength?: number;
  maxPrice?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(sites);
  const conditions = [];
  
  if (params.campgroundId) {
    conditions.push(eq(sites.campgroundId, params.campgroundId));
  }
  
  if (params.siteType && params.siteType.length > 0) {
    conditions.push(inArray(sites.siteType, params.siteType as any));
  }
  
  if (params.minOccupancy) {
    conditions.push(gte(sites.maxOccupancy, params.minOccupancy));
  }
  
  if (params.hasWater !== undefined) {
    conditions.push(eq(sites.hasWater, params.hasWater));
  }
  
  if (params.hasElectric !== undefined) {
    conditions.push(eq(sites.hasElectric, params.hasElectric));
  }
  
  if (params.hasSewer !== undefined) {
    conditions.push(eq(sites.hasSewer, params.hasSewer));
  }
  
  if (params.isPetFriendly !== undefined) {
    conditions.push(eq(sites.isPetFriendly, params.isPetFriendly));
  }
  
  if (params.isAccessible !== undefined) {
    conditions.push(eq(sites.isAccessible, params.isAccessible));
  }
  
  if (params.minRvLength) {
    conditions.push(gte(sites.rvMaxLength, params.minRvLength));
  }
  
  if (params.maxPrice) {
    conditions.push(lte(sites.pricePerNight, params.maxPrice.toString()));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query;
}

// ==================== AVAILABILITY HELPERS ====================

export async function upsertAvailability(data: typeof availability.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(availability).values(data).onDuplicateKeyUpdate({
    set: {
      status: data.status,
      checkedAt: new Date(),
    }
  });
}

export async function getAvailabilityBySiteId(siteId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(availability)
    .where(and(
      eq(availability.siteId, siteId),
      gte(availability.availableDate, startDate),
      lte(availability.availableDate, endDate)
    ))
    .orderBy(availability.availableDate);
}

export async function getAvailableSites(campgroundId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all sites for the campground
  const campgroundSites = await db.select().from(sites)
    .where(eq(sites.campgroundId, campgroundId));
  
  const siteIds = campgroundSites.map(s => s.id);
  if (siteIds.length === 0) return [];
  
  // Get availability for all sites in the date range
  const availabilityRecords = await db.select().from(availability)
    .where(and(
      inArray(availability.siteId, siteIds),
      gte(availability.availableDate, startDate),
      lte(availability.availableDate, endDate)
    ));
  
  // Group by site and check if all dates are available
  const siteAvailability = new Map<number, boolean>();
  
  for (const site of campgroundSites) {
    const siteRecords = availabilityRecords.filter(a => a.siteId === site.id);
    const allAvailable = siteRecords.every(a => a.status === 'available');
    siteAvailability.set(site.id, allAvailable && siteRecords.length > 0);
  }
  
  return campgroundSites.filter(site => siteAvailability.get(site.id));
}

export async function bulkUpsertAvailability(records: (typeof availability.$inferInsert)[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (records.length === 0) return;
  
  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await db.insert(availability).values(batch).onDuplicateKeyUpdate({
      set: {
        status: sql`VALUES(status)`,
        checkedAt: new Date(),
      }
    });
  }
}

// ==================== AMENITY HELPERS ====================

export async function createAmenity(data: typeof amenities.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(amenities).values(data);
  return result.insertId;
}

export async function getAllAmenities() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(amenities);
}

export async function getCampgroundAmenities(campgroundId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: amenities.id,
    name: amenities.name,
    category: amenities.category,
    icon: amenities.icon,
    description: amenities.description,
  })
  .from(campgroundAmenities)
  .innerJoin(amenities, eq(campgroundAmenities.amenityId, amenities.id))
  .where(eq(campgroundAmenities.campgroundId, campgroundId));
}

export async function addCampgroundAmenity(campgroundId: number, amenityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(campgroundAmenities).values({ campgroundId, amenityId });
}

// ==================== DATA SOURCE HELPERS ====================

export async function createDataSource(data: typeof dataSources.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(dataSources).values(data);
  return result.insertId;
}

export async function getDataSourceByName(name: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(dataSources).where(eq(dataSources.name, name)).limit(1);
  return result[0] || null;
}

export async function getAllDataSources() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dataSources).where(eq(dataSources.isActive, true));
}

export async function updateDataSourceStatus(id: number, lastSyncedAt?: Date, error?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updates: any = {};
  if (lastSyncedAt) {
    updates.lastSyncedAt = lastSyncedAt;
  }
  if (error) {
    updates.lastErrorAt = new Date();
    updates.lastErrorMessage = error;
  }
  
  await db.update(dataSources).set(updates).where(eq(dataSources.id, id));
}
