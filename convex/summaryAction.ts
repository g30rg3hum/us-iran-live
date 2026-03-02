"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

export const generateSummary = internalAction({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.runQuery(internal.summary.recentEventsInternal);

    if (events.length === 0) return;

    const eventList = events
      .map(
        (e, i) =>
          `${i + 1}. [Severity ${e.severity}/5, ${e.category}] ${e.title} — ${e.summary}`
      )
      .join("\n");

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `You are a concise news analyst. Based on these recent events from the US-Iran/Israel conflict tracker, respond with exactly two parts separated by a blank line:

1. A 1-2 sentence situation summary. No heading, no label — just the sentences. Be direct and factual.

2. A single sentence starting with "Outlook:" giving a realistic prediction of how much longer the current escalation/situation is likely to continue and why.

Recent events:
${eventList}

Write only the two parts, no preamble or labels besides "Outlook:".`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    if (text.trim()) {
      // Split summary and prediction
      const parts = text.trim().split(/\n\s*\n/);
      const summaryText = parts[0]?.trim() || "";
      const prediction = parts
        .slice(1)
        .join(" ")
        .trim()
        .replace(/^Outlook:\s*/i, "");

      await ctx.runMutation(internal.summary.storeSummary, {
        text: summaryText,
        prediction: prediction || null,
        generatedAt: Date.now(),
      });
    }
  },
});
