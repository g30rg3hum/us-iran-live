import Link from "next/link";
import EventTimeline from "../components/EventTimeline";
import SituationSummary from "../components/SituationSummary";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
          Middle East Conflict Tracker
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          AI-classified live updates on the US-Iran/Israel conflict. Auto-refreshes in real-time.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs text-zinc-500">Live — polling every 3 minutes</span>
        </div>
      </header>
      <div className="mb-6">
        <SituationSummary />
      </div>
      <div className="mb-6">
        <Link
          href="/gulf"
          className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 transition-colors hover:bg-amber-500/10"
        >
          <div>
            <span className="text-sm font-medium text-amber-400">
              UAE / Gulf Region
            </span>
            <span className="ml-2 text-xs text-zinc-500">
              Dubai &middot; Abu Dhabi &middot; Flights &middot; Layover info
            </span>
          </div>
          <span className="text-zinc-500">&rarr;</span>
        </Link>
      </div>
      <EventTimeline />
    </div>
  );
}
