"use client";

import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import EventCard from "./EventCard";

const FILTERS = [
  { key: "all", label: "All", minSeverity: undefined },
  { key: "notable", label: "Notable+", minSeverity: 2 },
  { key: "significant", label: "Significant+", minSeverity: 3 },
  { key: "major", label: "Major", minSeverity: 4 },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const ACTIVE_STYLES: Record<string, string> = {
  all: "bg-zinc-100 text-zinc-900",
  notable: "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30",
  significant: "bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30",
  major: "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30",
};

const EMPTY_LABELS: Record<string, string> = {
  all: "No events yet",
  notable: "No notable events",
  significant: "No significant events",
  major: "No major events",
};

export default function EventTimeline() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const activeFilter = FILTERS.find((f) => f.key === filter)!;
  const queryArgs =
    activeFilter.minSeverity !== undefined
      ? { minSeverity: activeFilter.minSeverity }
      : {};

  const { results, status, loadMore } = usePaginatedQuery(
    api.events.listRecent,
    queryArgs,
    { initialNumItems: 20 }
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.key
                ? ACTIVE_STYLES[f.key]
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {results.length === 0 && status !== "LoadingFirstPage" ? (
        <div className="rounded-lg border border-dashed border-zinc-700 p-12 text-center">
          <p className="text-lg text-zinc-400">{EMPTY_LABELS[filter]}</p>
          {filter === "all" && (
            <p className="mt-1 text-sm text-zinc-600">
              Events will appear here once the RSS feeds are polled. Run the{" "}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                seed
              </code>{" "}
              mutation in the Convex dashboard to initialize feeds, then wait
              for the cron to run.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {status === "LoadingFirstPage" &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-r-lg border-l-4 border-l-zinc-700 bg-zinc-900"
              />
            ))}
          {results.map((event) => (
            <EventCard
              key={event._id}
              title={event.title}
              summary={event.summary}
              severity={event.severity}
              category={event.category}
              source={event.source}
              sourceUrl={event.sourceUrl}
              publishedAt={event.publishedAt}
            />
          ))}
        </div>
      )}

      {status === "CanLoadMore" && (
        <button
          onClick={() => loadMore(20)}
          className="mt-4 w-full rounded-lg bg-zinc-800 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-300"
        >
          Load more
        </button>
      )}
      {status === "LoadingMore" && (
        <div className="mt-4 flex justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
        </div>
      )}
    </div>
  );
}
