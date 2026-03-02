"use client";

import { usePaginatedQuery } from "convex/react";
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

export default function FlightAlerts() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.flights.listRecent,
    {},
    { initialNumItems: 10 }
  );

  if (results.length === 0 && status !== "LoadingFirstPage") {
    return (
      <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center">
        <p className="text-sm text-zinc-400">
          No flight disruptions reported for the Gulf region right now.
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Monitoring airlines, airspace closures, and airport disruptions
          affecting UAE transit.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {status === "LoadingFirstPage" &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900"
            />
          ))}
        {results.map((alert) => (
          <div
            key={alert._id}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:bg-zinc-800/80"
          >
            <h3 className="text-sm font-semibold text-zinc-100">
              {alert.title}
            </h3>
            {alert.summary && (
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                {alert.summary}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
              <span>{alert.source}</span>
              <span>{timeAgo(alert.publishedAt)}</span>
              <a
                href={alert.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-zinc-500 transition-colors hover:text-zinc-300"
              >
                Source &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>

      {status === "CanLoadMore" && (
        <button
          onClick={() => loadMore(10)}
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
