import {
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";

export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const summary = await ctx.db
      .query("summaries")
      .withIndex("by_generatedAt")
      .order("desc")
      .first();
    return summary;
  },
});

export const recentEventsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(15);
    return events.map((e) => ({
      title: e.title,
      summary: e.summary,
      severity: e.severity,
      category: e.category,
    }));
  },
});

export const storeSummary = internalMutation({
  args: {
    text: v.string(),
    prediction: v.union(v.string(), v.null()),
    generatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("summaries", {
      text: args.text,
      prediction: args.prediction,
      generatedAt: args.generatedAt,
    });
  },
});
