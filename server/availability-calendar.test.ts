import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { addDays } from "date-fns";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("availability calendar", () => {
  it("should fetch booked dates for a campground", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();
    const endDate = addDays(new Date(), 90);

    const bookedDates = await caller.bookings.getBookedDates({
      campgroundId: 1,
      startDate,
      endDate,
    });

    expect(Array.isArray(bookedDates)).toBe(true);
    // Each booked date should have date and status properties
    if (bookedDates.length > 0) {
      expect(bookedDates[0]).toHaveProperty("date");
      expect(bookedDates[0]).toHaveProperty("status");
      expect(bookedDates[0].status).toBe("booked");
    }
  });

  it("should return booked dates within the specified range", async () => {
    const authCtx = createAuthContext();
    const publicCtx = createPublicContext();
    const authCaller = appRouter.createCaller(authCtx);
    const publicCaller = appRouter.createCaller(publicCtx);

    // Create a booking
    const checkInDate = addDays(new Date(), 7);
    const checkOutDate = addDays(new Date(), 10);

    await authCaller.bookings.create({
      campgroundId: 1,
      checkInDate,
      checkOutDate,
      numberOfGuests: 2,
    });

    // Fetch booked dates
    const startDate = new Date();
    const endDate = addDays(new Date(), 30);

    const bookedDates = await publicCaller.bookings.getBookedDates({
      campgroundId: 1,
      startDate,
      endDate,
    });

    expect(bookedDates.length).toBeGreaterThan(0);
    
    // Verify all returned dates have the correct status
    bookedDates.forEach(bd => {
      expect(bd.status).toBe("booked");
    });
  });

  it("should not require authentication to view booked dates", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();
    const endDate = addDays(new Date(), 30);

    // Should not throw error for unauthenticated users
    await expect(
      caller.bookings.getBookedDates({
        campgroundId: 1,
        startDate,
        endDate,
      })
    ).resolves.toBeDefined();
  });

  it("should return empty array for campground with no bookings", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();
    const endDate = addDays(new Date(), 30);

    const bookedDates = await caller.bookings.getBookedDates({
      campgroundId: 9999, // Non-existent campground
      startDate,
      endDate,
    });

    expect(bookedDates).toEqual([]);
  });
});
