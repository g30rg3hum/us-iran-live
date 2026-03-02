"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Parser from "rss-parser";

const FLIGHT_FEEDS = [
  {
    name: "Reuters Travel",
    url: "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best&best-type=reuters-best-travel",
  },
  {
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
  },
  {
    name: "BBC News",
    url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
  },
];

const FLIGHT_KEYWORDS = [
  "flight",
  "flights",
  "airline",
  "airlines",
  "airport",
  "aviation",
  "airspace",
  "faa",
  "notam",
  "divert",
  "diverted",
  "grounded",
  "suspended",
  "cancellation",
  "cancelled",
  "canceled",
  "reroute",
  "rerouted",
  "no-fly",
  "fly zone",
  "air traffic",
  "layover",
  "transit",
];

const REGION_KEYWORDS = [
  "dubai",
  "abu dhabi",
  "uae",
  "emirates",
  "gulf",
  "middle east",
  "iran",
  "iraq",
  "qatar",
  "bahrain",
  "oman",
  "kuwait",
  "strait of hormuz",
  "persian gulf",
];

function isFlightRelevant(title: string, snippet?: string): boolean {
  const text = `${title} ${snippet ?? ""}`.toLowerCase();
  const hasFlightWord = FLIGHT_KEYWORDS.some((kw) => text.includes(kw));
  const hasRegionWord = REGION_KEYWORDS.some((kw) => text.includes(kw));
  return hasFlightWord && hasRegionWord;
}

function similarity(a: string, b: string): number {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const ta = new Set<string>();
  const tb = new Set<string>();
  const ca = clean(a);
  const cb = clean(b);
  for (let i = 0; i <= ca.length - 3; i++) ta.add(ca.substring(i, i + 3));
  for (let i = 0; i <= cb.length - 3; i++) tb.add(cb.substring(i, i + 3));
  let intersection = 0;
  for (const t of ta) if (tb.has(t)) intersection++;
  const union = ta.size + tb.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export const pollFlightNews = internalAction({
  args: {},
  handler: async (ctx) => {
    const recent = await ctx.runQuery(internal.flights.recentForDedup);

    const parser = new Parser({
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsTracker/1.0)" },
    });

    let ingested = 0;

    for (const feed of FLIGHT_FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = (parsed.items || []).slice(0, 30);

        for (const item of items) {
          if (!item.title || !item.link) continue;
          if (!isFlightRelevant(item.title, item.contentSnippet)) continue;

          const pubDate = item.pubDate
            ? new Date(item.pubDate).getTime()
            : Date.now();

          if (Date.now() - pubDate > 48 * 60 * 60 * 1000) continue;

          const isDup = recent.some(
            (r) =>
              r.sourceUrl === item.link ||
              similarity(r.title, item.title!) > 0.6
          );

          if (!isDup) {
            await ctx.runMutation(internal.flights.insertAlert, {
              title: item.title,
              summary: item.contentSnippet?.slice(0, 300) || "",
              sourceUrl: item.link,
              source: feed.name,
              publishedAt: pubDate,
            });
            ingested++;
          }
        }
      } catch (err) {
        console.error(`Failed to fetch flight feed ${feed.name}:`, err);
      }
    }

    if (ingested > 0) {
      console.log(`Ingested ${ingested} flight alerts`);
    }
  },
});
