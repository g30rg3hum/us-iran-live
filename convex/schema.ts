import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    title: v.string(),
    summary: v.string(),
    severity: v.number(), // 1-5
    category: v.string(), // "military", "diplomatic", "sanctions", "nuclear", "humanitarian", "other"
    source: v.string(),
    sourceUrl: v.string(),
    rawTitle: v.string(),
    publishedAt: v.number(), // unix timestamp ms
    createdAt: v.number(),
  })
    .index("by_publishedAt", ["publishedAt"])
    .index("by_createdAt", ["createdAt"])
    .index("by_severity", ["severity"]),

  summaries: defineTable({
    text: v.string(),
    prediction: v.optional(v.union(v.string(), v.null())),
    generatedAt: v.number(),
  }).index("by_generatedAt", ["generatedAt"]),

  flightSummaries: defineTable({
    text: v.string(),
    generatedAt: v.number(),
  }).index("by_generatedAt", ["generatedAt"]),

  flightAlerts: defineTable({
    title: v.string(),
    summary: v.string(),
    sourceUrl: v.string(),
    source: v.string(),
    publishedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_publishedAt", ["publishedAt"])
    .index("by_createdAt", ["createdAt"]),

  sources: defineTable({
    name: v.string(),
    rssUrl: v.string(),
    lastPolled: v.optional(v.number()),
  }).index("by_name", ["name"]),
});
