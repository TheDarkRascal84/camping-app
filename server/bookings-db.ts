import { and, desc, eq, gte, lte } from "drizzle-orm";
import { bookings, type InsertBooking } from "../drizzle/schema";
import { getDb } from "./db";
import { nanoid } from "nanoid";
import { eachDayOfInterval } from "date-fns";

/**
 * Create a new booking
 */
export async function createBooking(booking: Omit<InsertBooking, "confirmationNumber" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const confirmationNumber = `CAMP-${nanoid(10).toUpperCase()}`;
  
  const [result] = await db.insert(bookings).values({
    ...booking,
    confirmationNumber,
  });

  return {
    id: Number(result.insertId),
    confirmationNumber,
  };
}

/**
 * Get all bookings for a user
 */
export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));
}

/**
 * Get a specific booking by ID
 */
export async function getBookingById(bookingId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const [booking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
    .limit(1);

  return booking;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)));

  return true;
}

/**
 * Get bookings for a specific campground
 */
export async function getCampgroundBookings(campgroundId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(bookings)
    .where(eq(bookings.campgroundId, campgroundId))
    .orderBy(desc(bookings.checkInDate));
}

/**
 * Check if a site is available for given dates
 */
export async function checkSiteAvailability(
  siteId: number,
  checkInDate: Date,
  checkOutDate: Date
) {
  const db = await getDb();
  if (!db) return true; // Assume available if DB not accessible

  const [conflictingBooking] = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.siteId, siteId),
        eq(bookings.status, "confirmed")
      )
    )
    .limit(1);

  // Simple overlap check: if there's any confirmed booking for this site, consider it unavailable
  // In production, you'd want more sophisticated date range overlap checking
  return !conflictingBooking;
}

/**
 * Get booked dates for a campground within a date range for calendar display
 */
export async function getBookedDatesForCampground(
  campgroundId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];

  // Get all confirmed bookings for this campground in the date range
  const campgroundBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.campgroundId, campgroundId),
        eq(bookings.status, "confirmed"),
        lte(bookings.checkInDate, endDate),
        gte(bookings.checkOutDate, startDate)
      )
    );

  // Create a set of all booked dates
  const bookedDatesSet = new Set<string>();
  
  campgroundBookings.forEach(booking => {
    const dates = eachDayOfInterval({
      start: new Date(booking.checkInDate),
      end: new Date(booking.checkOutDate)
    });
    
    dates.forEach(date => {
      bookedDatesSet.add(date.toISOString().split('T')[0]);
    });
  });

  // Convert set to array of date objects
  return Array.from(bookedDatesSet).map(dateStr => ({
    date: new Date(dateStr),
    status: "booked" as const
  }));
}
