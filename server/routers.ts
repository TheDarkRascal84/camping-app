import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { ingestionService } from "./ingestion";

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
