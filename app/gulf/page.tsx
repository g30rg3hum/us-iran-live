import Link from "next/link";
import GulfSection from "../../components/GulfSection";
import FlightAlerts from "../../components/FlightAlerts";

export default function GulfPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          &larr; Back to all events
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
          UAE / Gulf Region
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Conflict events and flight disruptions affecting Dubai, Abu Dhabi, and
          surrounding area. Relevant for layovers and transit.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">
          Flight Disruptions
        </h2>
        <FlightAlerts />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">
          Regional Conflict Events
        </h2>
        <GulfSection />
      </section>
    </div>
  );
}
