import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { ingestionService } from "./ingestion";
import { fetchCampgroundImages } from "./images";
import * as bookingsDb from "./bookings-db";
import { protectedProcedure } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Campground search and listing
  campgrounds: router({
    search: publicProcedure
      .input(z.object({
        state: z.string().optional(),
        city: z.string().optional(),
        campgroundType: z.array(z.enum(["tent", "rv", "cabin", "dispersed", "group", "mixed"])).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        radiusMiles: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await db.searchCampgrounds(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCampgroundById(input.id);
      }),

    getSites: publicProcedure
      .input(z.object({ campgroundId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSitesByCampgroundId(input.campgroundId);
      }),

    getAmenities: publicProcedure
      .input(z.object({ campgroundId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCampgroundAmenities(input.campgroundId);
      }),
  }),

  // Site filtering
  sites: router({
    filter: publicProcedure
      .input(z.object({
        campgroundId: z.number().optional(),
        siteType: z.array(z.enum(["tent", "rv", "cabin", "group", "equestrian", "boat"])).optional(),
        minOccupancy: z.number().optional(),
        hasWater: z.boolean().optional(),
        hasElectric: z.boolean().optional(),
        hasSewer: z.boolean().optional(),
        isPetFriendly: z.boolean().optional(),
        isAccessible: z.boolean().optional(),
        minRvLength: z.number().optional(),
        maxPrice: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.filterSites(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSiteById(input.id);
      }),
  }),

  // Availability checking
  availability: router({
    checkSite: publicProcedure
      .input(z.object({
        siteId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getAvailabilityBySiteId(input.siteId, input.startDate, input.endDate);
      }),

    checkCampground: publicProcedure
      .input(z.object({
        campgroundId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getAvailableSites(input.campgroundId, input.startDate, input.endDate);
      }),
  }),

  // Amenities
  amenities: router({
    getAll: publicProcedure.query(async () => {
      return await db.getAllAmenities();
    }),
  }),

  // Images
  // Booking management
  bookings: router({    create: protectedProcedure
      .input(z.object({
        campgroundId: z.number(),
        siteId: z.number().optional(),
        checkInDate: z.date(),
        checkOutDate: z.date(),
        numberOfGuests: z.number().min(1),
        totalPrice: z.string().optional(),
        specialRequests: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        
        const result = await bookingsDb.createBooking({
          userId: ctx.user.id,
          campgroundId: input.campgroundId,
          siteId: input.siteId,
          checkInDate: input.checkInDate,
          checkOutDate: input.checkOutDate,
          numberOfGuests: input.numberOfGuests,
          totalPrice: input.totalPrice,
          specialRequests: input.specialRequests,
          contactEmail: input.contactEmail || ctx.user.email || undefined,
          contactPhone: input.contactPhone,
          status: "confirmed",
        });
        
        return result;
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        return await bookingsDb.getUserBookings(ctx.user.id);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        return await bookingsDb.getBookingById(input.id, ctx.user.id);
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        await bookingsDb.cancelBooking(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  images: router({
    getCampgroundImages: publicProcedure
      .input(
        z.object({
          campgroundName: z.string(),
          city: z.string(),
          state: z.string(),
          campgroundType: z.string(),
          limit: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await fetchCampgroundImages(input);
      }),
  }),

  // Data ingestion (admin only in production)
  ingestion: router({
    syncCampgrounds: publicProcedure
      .input(z.object({
        adapterName: z.string(),
        state: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        radiusMiles: z.number().optional(),
        limit: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const count = await ingestionService.syncCampgrounds(input.adapterName, input);
        return { success: true, count };
      }),

    syncSites: publicProcedure
      .input(z.object({ campgroundId: z.number() }))
      .mutation(async ({ input }) => {
        const count = await ingestionService.syncSites(input.campgroundId);
        return { success: true, count };
      }),

    syncAvailability: publicProcedure
      .input(z.object({
        campgroundId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .mutation(async ({ input }) => {
        const count = await ingestionService.syncAvailability(
          input.campgroundId,
          input.startDate,
          input.endDate
        );
        return { success: true, count };
      }),
  }),
});

export type AppRouter = typeof appRouter;
