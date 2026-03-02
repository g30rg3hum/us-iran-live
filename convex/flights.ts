import {
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const listRecent = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flightAlerts")
      .withIndex("by_publishedAt")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const insertAlert = internalMutation({
  args: {
    title: v.string(),
    summary: v.string(),
    sourceUrl: v.string(),
    source: v.string(),
    publishedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("flightAlerts", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getLatestFlightSummary = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("flightSummaries")
      .withIndex("by_generatedAt")
      .order("desc")
      .first();
  },
});

export const recentAlertsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const alerts = await ctx.db
      .query("flightAlerts")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(20);
    return alerts.map((a) => ({
      title: a.title,
      summary: a.summary,
    }));
  },
});

export const storeFlightSummary = internalMutation({
  args: {
    text: v.string(),
    generatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("flightSummaries", {
      text: args.text,
      generatedAt: args.generatedAt,
    });
  },
});

export const recentForDedup = internalQuery({
  args: {},
  handler: async (ctx) => {
    const alerts = await ctx.db
      .query("flightAlerts")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
    return alerts.map((a) => ({ title: a.title, sourceUrl: a.sourceUrl }));
  },
});
