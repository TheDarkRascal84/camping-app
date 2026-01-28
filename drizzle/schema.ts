import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, index, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Bookings - user reservations for campsites
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campgroundId: int("campgroundId").notNull(),
  siteId: int("siteId"),
  
  // Booking details
  checkInDate: timestamp("checkInDate").notNull(),
  checkOutDate: timestamp("checkOutDate").notNull(),
  numberOfGuests: int("numberOfGuests").notNull().default(1),
  
  // Pricing
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Status tracking
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  confirmationNumber: varchar("confirmationNumber", { length: 64 }),
  
  // Additional information
  specialRequests: text("specialRequests"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Campgrounds (facilities) - main camping locations
 */
export const campgrounds = mysqlTable("campgrounds", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("externalId", { length: 128 }), // ID from external source (RIDB, state parks, etc.)
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Location
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  
  // Type and classification
  campgroundType: mysqlEnum("campgroundType", ["tent", "rv", "cabin", "dispersed", "group", "mixed"]).notNull(),
  managingOrganization: varchar("managingOrganization", { length: 255 }), // e.g., "National Park Service", "State Parks"
  
  // Booking information
  bookingUrl: text("bookingUrl"),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  reservable: boolean("reservable").default(true),
  
  // Data source tracking
  dataSource: varchar("dataSource", { length: 64 }).notNull(), // "ridb", "state_parks", "private", etc.
  dataSourceUrl: text("dataSourceUrl"),
  
  // Media
  photos: json("photos").$type<string[]>(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
}, (table) => ({
  externalIdIdx: index("externalId_idx").on(table.externalId),
  locationIdx: index("location_idx").on(table.latitude, table.longitude),
  stateIdx: index("state_idx").on(table.state),
  typeIdx: index("type_idx").on(table.campgroundType),
}));

export type Campground = typeof campgrounds.$inferSelect;
export type InsertCampground = typeof campgrounds.$inferInsert;

/**
 * Individual campsites within campgrounds
 */
export const sites = mysqlTable("sites", {
  id: int("id").autoincrement().primaryKey(),
  campgroundId: int("campgroundId").notNull().references(() => campgrounds.id, { onDelete: "cascade" }),
  externalId: varchar("externalId", { length: 128 }),
  
  // Site identification
  siteName: varchar("siteName", { length: 128 }).notNull(),
  siteNumber: varchar("siteNumber", { length: 64 }),
  siteType: mysqlEnum("siteType", ["tent", "rv", "cabin", "group", "equestrian", "boat"]).notNull(),
  
  // Specifications
  maxOccupancy: int("maxOccupancy"),
  maxVehicles: int("maxVehicles"),
  rvMaxLength: int("rvMaxLength"), // in feet
  
  // Pricing
  pricePerNight: decimal("pricePerNight", { precision: 8, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Amenities (boolean flags for quick filtering)
  hasWater: boolean("hasWater").default(false),
  hasElectric: boolean("hasElectric").default(false),
  hasSewer: boolean("hasSewer").default(false),
  hasFireRing: boolean("hasFireRing").default(false),
  hasPicnicTable: boolean("hasPicnicTable").default(false),
  isPetFriendly: boolean("isPetFriendly").default(false),
  isAccessible: boolean("isAccessible").default(false),
  
  // Additional details
  amenitiesJson: json("amenitiesJson").$type<Record<string, any>>(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  campgroundIdx: index("campground_idx").on(table.campgroundId),
  typeIdx: index("site_type_idx").on(table.siteType),
}));

export type Site = typeof sites.$inferSelect;
export type InsertSite = typeof sites.$inferInsert;

/**
 * Availability tracking for sites
 */
export const availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  siteId: int("siteId").notNull().references(() => sites.id, { onDelete: "cascade" }),
  
  // Date range
  availableDate: timestamp("availableDate").notNull(),
  
  // Status
  status: mysqlEnum("status", ["available", "reserved", "unavailable", "unknown"]).notNull(),
  
  // Metadata
  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  siteIdx: index("site_idx").on(table.siteId),
  dateIdx: index("date_idx").on(table.availableDate),
  statusIdx: index("status_idx").on(table.status),
  siteDateUnique: unique("site_date_unique").on(table.siteId, table.availableDate),
}));

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = typeof availability.$inferInsert;

/**
 * Amenities reference table
 */
export const amenities = mysqlTable("amenities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  category: mysqlEnum("category", ["utilities", "facilities", "recreation", "accessibility", "other"]).notNull(),
  icon: varchar("icon", { length: 64 }), // Icon identifier for UI
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Amenity = typeof amenities.$inferSelect;
export type InsertAmenity = typeof amenities.$inferInsert;

/**
 * Junction table for campground amenities
 */
export const campgroundAmenities = mysqlTable("campgroundAmenities", {
  id: int("id").autoincrement().primaryKey(),
  campgroundId: int("campgroundId").notNull().references(() => campgrounds.id, { onDelete: "cascade" }),
  amenityId: int("amenityId").notNull().references(() => amenities.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  campgroundAmenityUnique: unique("campground_amenity_unique").on(table.campgroundId, table.amenityId),
}));

export type CampgroundAmenity = typeof campgroundAmenities.$inferSelect;
export type InsertCampgroundAmenity = typeof campgroundAmenities.$inferInsert;

/**
 * Data sources metadata for tracking external APIs
 */
export const dataSources = mysqlTable("dataSources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  type: mysqlEnum("type", ["api", "scraper", "manual"]).notNull(),
  baseUrl: text("baseUrl"),
  apiKey: text("apiKey"), // Encrypted or reference to secure storage
  
  // Rate limiting
  rateLimit: int("rateLimit"), // requests per minute
  rateLimitWindow: int("rateLimitWindow").default(60), // in seconds
  
  // Status tracking
  isActive: boolean("isActive").default(true),
  lastSyncedAt: timestamp("lastSyncedAt"),
  lastErrorAt: timestamp("lastErrorAt"),
  lastErrorMessage: text("lastErrorMessage"),
  
  // Metadata
  config: json("config").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = typeof dataSources.$inferInsert;
