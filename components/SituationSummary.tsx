"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function cleanSummaryText(text: string): string {
  return text
    .replace(/^#+\s*situation\s*overview\s*/i, "")
    .replace(/\*\*situation\s*overview\*\*:?\s*/i, "")
    .replace(/^situation\s*overview:?\s*/i, "")
    .trim();
}

export default function SituationSummary() {
  const summary = useQuery(api.summary.getLatest);

  if (summary === undefined) {
    return (
      <div className="animate-pulse rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="h-4 w-32 rounded bg-zinc-800" />
        <div className="mt-3 space-y-2">
          <div className="h-3 rounded bg-zinc-800" />
          <div className="h-3 w-3/4 rounded bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (summary === null) {
    return null;
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-300">
          Situation Overview
        </h2>
        <span className="text-xs text-zinc-600">
          Updated {timeAgo(summary.generatedAt)}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-400">
        {cleanSummaryText(summary.text)}
      </p>
      {summary.prediction && (
        <p className="mt-2 text-sm leading-relaxed text-amber-400/80">
          <span className="font-medium">Outlook:</span> {summary.prediction}
        </p>
      )}
    </div>
  );
}
