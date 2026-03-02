import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sources").collect();
  },
});

export const listInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sources").collect();
  },
});

export const updateLastPolled = internalMutation({
  args: {
    id: v.id("sources"),
    lastPolled: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastPolled: args.lastPolled });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("sources").collect();
    if (existing.length > 0) {
      return "Sources already seeded";
    }

    const feeds = [
      {
        name: "Al Jazeera",
        rssUrl: "https://www.aljazeera.com/xml/rss/all.xml",
      },
      {
        name: "BBC World",
        rssUrl: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
      },
      {
        name: "Reuters World",
        rssUrl: "https://www.reutersagency.com/feed/?taxonomy=best-regions&post_type=best",
      },
      {
        name: "AP News",
        rssUrl: "https://rsshub.app/apnews/topics/world-news",
      },
      {
        name: "Google News - Iran",
        rssUrl: "https://news.google.com/rss/search?q=iran+israel+conflict&hl=en-US&gl=US&ceid=US:en",
      },
    ];

    for (const feed of feeds) {
      await ctx.db.insert("sources", feed);
    }

    return `Seeded ${feeds.length} sources`;
  },
});
