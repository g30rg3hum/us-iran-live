import SeverityBadge from "./SeverityBadge";

const SEVERITY_BORDER: Record<number, string> = {
  1: "border-l-zinc-600",
  2: "border-l-blue-500",
  3: "border-l-yellow-500",
  4: "border-l-orange-500",
  5: "border-l-red-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  military: "Military",
  diplomatic: "Diplomatic",
  sanctions: "Sanctions",
  nuclear: "Nuclear",
  humanitarian: "Humanitarian",
  other: "Other",
};

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

interface EventCardProps {
  title: string;
  summary: string;
  severity: number;
  category: string;
  source: string;
  sourceUrl: string;
  publishedAt: number;
}

export default function EventCard({
  title,
  summary,
  severity,
  category,
  source,
  sourceUrl,
  publishedAt,
}: EventCardProps) {
  const borderColor = SEVERITY_BORDER[severity] ?? SEVERITY_BORDER[1];

  return (
    <div
      className={`border-l-4 ${borderColor} rounded-r-lg bg-zinc-900 p-4 transition-colors hover:bg-zinc-800/80`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-zinc-100">
          {title}
        </h3>
        <SeverityBadge severity={severity} />
      </div>
      <p className="mb-3 text-sm leading-relaxed text-zinc-400">{summary}</p>
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-medium text-zinc-400">
          {CATEGORY_LABELS[category] ?? category}
        </span>
        <span>{source}</span>
        <span>{timeAgo(publishedAt)}</span>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Read source &rarr;
        </a>
      </div>
    </div>
  );
}
