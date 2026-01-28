import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

describe("bookings", () => {
  it("should create a booking with confirmation number", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 7); // 7 days from now
    
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 10); // 10 days from now

    const result = await caller.bookings.create({
      campgroundId: 1,
      siteId: 1,
      checkInDate,
      checkOutDate,
      numberOfGuests: 2,
      totalPrice: "150.00",
      specialRequests: "Early check-in if possible",
      contactEmail: "test@example.com",
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("confirmationNumber");
    expect(result.confirmationNumber).toMatch(/^CAMP-[A-Z0-9]{10}$/);
  });

  it("should list user bookings", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const bookings = await caller.bookings.list();

    expect(Array.isArray(bookings)).toBe(true);
    // May have bookings from previous test
    if (bookings.length > 0) {
      expect(bookings[0]).toHaveProperty("id");
      expect(bookings[0]).toHaveProperty("userId");
      expect(bookings[0]).toHaveProperty("confirmationNumber");
    }
  });

  it("should get a specific booking by ID", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a booking first
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 7);
    
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 10);

    const created = await caller.bookings.create({
      campgroundId: 1,
      checkInDate,
      checkOutDate,
      numberOfGuests: 2,
    });

    const booking = await caller.bookings.getById({ id: created.id });

    expect(booking).toBeDefined();
    expect(booking?.id).toBe(created.id);
    expect(booking?.confirmationNumber).toBe(created.confirmationNumber);
  });

  it("should cancel a booking", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a booking first
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 7);
    
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 10);

    const created = await caller.bookings.create({
      campgroundId: 1,
      checkInDate,
      checkOutDate,
      numberOfGuests: 2,
    });

    const result = await caller.bookings.cancel({ id: created.id });

    expect(result).toEqual({ success: true });

    // Verify it's cancelled
    const booking = await caller.bookings.getById({ id: created.id });
    expect(booking?.status).toBe("cancelled");
  });

  it("should require authentication for booking operations", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 7);
    
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 10);

    await expect(
      caller.bookings.create({
        campgroundId: 1,
        checkInDate,
        checkOutDate,
        numberOfGuests: 2,
      })
    ).rejects.toThrow();
  });
});
