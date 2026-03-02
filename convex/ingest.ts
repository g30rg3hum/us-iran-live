"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import Parser from "rss-parser";

const RELEVANCE_KEYWORDS = [
  "iran",
  "israel",
  "hezbollah",
  "houthi",
  "houthis",
  "tehran",
  "idf",
  "irgc",
  "netanyahu",
  "khamenei",
  "airstrike",
  "missile",
  "drone",
  "nuclear",
  "enrichment",
  "sanctions",
  "strait of hormuz",
  "gaza",
  "hamas",
  "lebanon",
  "beirut",
  "pentagon",
  "centcom",
  "middle east",
  "red sea",
  "proxy",
  "escalation",
  "ceasefire",
  "retaliation",
  "military strike",
  "bombing",
  "us troops",
  "american forces",
  "iranian",
  "israeli",
  "west bank",
  "rafah",
  "nasrallah",
  "axis of resistance",
  "dubai",
  "abu dhabi",
  "uae",
  "emirates",
  "strait of hormuz",
  "persian gulf",
  "gulf of oman",
];

function isRelevant(title: string, contentSnippet?: string): boolean {
  const text = `${title} ${contentSnippet ?? ""}`.toLowerCase();
  return RELEVANCE_KEYWORDS.some((kw) => text.includes(kw));
}

// Simple trigram similarity for dedup
function trigrams(s: string): Set<string> {
  const clean = s.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const set = new Set<string>();
  for (let i = 0; i <= clean.length - 3; i++) {
    set.add(clean.substring(i, i + 3));
  }
  return set;
}

function similarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  let intersection = 0;
  for (const t of ta) {
    if (tb.has(t)) intersection++;
  }
  const union = ta.size + tb.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

interface RawArticle {
  title: string;
  link: string;
  pubDate: number;
  source: string;
  contentSnippet?: string;
}

interface ClassifiedEvent {
  title: string;
  summary: string;
  severity: number;
  category: string;
}

async function classifyArticles(
  articles: RawArticle[]
): Promise<ClassifiedEvent[]> {
  if (articles.length === 0) return [];

  const client = new Anthropic();

  const articleList = articles
    .map(
      (a, i) =>
        `[${i + 1}] "${a.title}"${a.contentSnippet ? `\nSnippet: ${a.contentSnippet.slice(0, 200)}` : ""}`
    )
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a news analyst tracking the US-Iran/Israel conflict. For each article below, provide:
1. A concise rewritten title (max 15 words, factual, no clickbait)
2. A 1-2 sentence summary of significance
3. Severity rating 1-5:
   1 = Low: routine diplomatic statements, minor developments
   2 = Notable: meaningful policy shifts, notable military movements
   3 = Significant: direct confrontations, major sanctions, key negotiations
   4 = Major: military strikes, significant casualties, treaty changes
   5 = Critical: war declarations, nuclear developments, major attacks on forces
4. Category: one of "military", "diplomatic", "sanctions", "nuclear", "humanitarian", "other"

Articles:
${articleList}

Respond in JSON array format only, no other text:
[{"title": "...", "summary": "...", "severity": N, "category": "..."}, ...]

Match the array order to the article numbers.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]) as ClassifiedEvent[];
    return parsed.map((item) => ({
      title: item.title || "Untitled",
      summary: item.summary || "",
      severity: Math.min(5, Math.max(1, Math.round(item.severity || 1))),
      category: item.category || "other",
    }));
  } catch {
    console.error("Failed to parse Claude response:", text.slice(0, 500));
    return [];
  }
}

export const pollAllFeeds = internalAction({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.runQuery(internal.sources.listInternal);
    const recentEvents = await ctx.runQuery(
      internal.events.listRecentForDedup
    );

    const parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NewsTracker/1.0)",
      },
    });

    const allArticles: RawArticle[] = [];

    for (const source of sources) {
      try {
        const feed = await parser.parseURL(source.rssUrl);
        const items = (feed.items || []).slice(0, 20);

        for (const item of items) {
          if (!item.title || !item.link) continue;
          if (!isRelevant(item.title, item.contentSnippet)) continue;

          const pubDate = item.pubDate
            ? new Date(item.pubDate).getTime()
            : Date.now();

          // Skip articles older than 24h
          if (Date.now() - pubDate > 24 * 60 * 60 * 1000) continue;

          // Deduplicate: check URL and title similarity
          const isDuplicate = recentEvents.some(
            (existing) =>
              existing.sourceUrl === item.link ||
              similarity(existing.rawTitle, item.title!) > 0.6
          );

          if (!isDuplicate) {
            allArticles.push({
              title: item.title,
              link: item.link,
              pubDate,
              source: source.name,
              contentSnippet: item.contentSnippet,
            });
          }
        }

        // Update last polled time
        await ctx.runMutation(internal.sources.updateLastPolled, {
          id: source._id,
          lastPolled: Date.now(),
        });
      } catch (err) {
        console.error(`Failed to fetch ${source.name}:`, err);
      }
    }

    if (allArticles.length === 0) {
      console.log("No new relevant articles found");
      return;
    }

    // Batch classify (up to 10 at a time)
    for (let i = 0; i < allArticles.length; i += 10) {
      const batch = allArticles.slice(i, i + 10);
      const classified = await classifyArticles(batch);

      for (let j = 0; j < classified.length && j < batch.length; j++) {
        await ctx.runMutation(internal.events.insertEvent, {
          title: classified[j].title,
          summary: classified[j].summary,
          severity: classified[j].severity,
          category: classified[j].category,
          source: batch[j].source,
          sourceUrl: batch[j].link,
          rawTitle: batch[j].title,
          publishedAt: batch[j].pubDate,
        });
      }
    }

    console.log(`Ingested ${allArticles.length} new events`);
  },
});
