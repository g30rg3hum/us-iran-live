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
    minSeverity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("events")
      .withIndex("by_publishedAt")
      .order("desc")
      .paginate(args.paginationOpts);

    if (args.minSeverity !== undefined) {
      return {
        ...results,
        page: results.page.filter((e) => e.severity >= args.minSeverity!),
      };
    }
    return results;
  },
});

export const insertEvent = internalMutation({
  args: {
    title: v.string(),
    summary: v.string(),
    severity: v.number(),
    category: v.string(),
    source: v.string(),
    sourceUrl: v.string(),
    rawTitle: v.string(),
    publishedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("events", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listGulfEvents = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("events")
      .withIndex("by_publishedAt")
      .order("desc")
      .paginate(args.paginationOpts);

    const gulfKeywords = [
      "dubai",
      "abu dhabi",
      "uae",
      "emirates",
      "gulf",
      "persian gulf",
      "strait of hormuz",
      "bahrain",
      "qatar",
      "oman",
      "kuwait",
    ];

    return {
      ...results,
      page: results.page.filter((e) => {
        const text =
          `${e.title} ${e.summary} ${e.rawTitle}`.toLowerCase();
        return gulfKeywords.some((kw) => text.includes(kw));
      }),
    };
  },
});

export const listRecentForDedup = internalQuery({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const events = await ctx.db
      .query("events")
      .withIndex("by_createdAt")
      .order("desc")
      .take(200);
    return events
      .filter((e) => e.createdAt > oneDayAgo)
      .map((e) => ({ rawTitle: e.rawTitle, sourceUrl: e.sourceUrl }));
  },
});
