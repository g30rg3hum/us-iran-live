"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import EventCard from "./EventCard";

export default function GulfSection() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.events.listGulfEvents,
    {},
    { initialNumItems: 20 }
  );

  return (
    <div>
      {results.length === 0 && status !== "LoadingFirstPage" ? (
        <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center">
          <p className="text-sm text-zinc-500">
            No Gulf-region events right now — your layover looks clear.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {status === "LoadingFirstPage" &&
            Array.from({ length: 2 }).map((_, i) => (
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
