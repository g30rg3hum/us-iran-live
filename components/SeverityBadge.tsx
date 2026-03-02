const SEVERITY_CONFIG: Record<
  number,
  { label: string; bg: string; text: string; border: string }
> = {
  1: {
    label: "Low",
    bg: "bg-zinc-800",
    text: "text-zinc-300",
    border: "border-zinc-600",
  },
  2: {
    label: "Notable",
    bg: "bg-blue-950",
    text: "text-blue-300",
    border: "border-blue-700",
  },
  3: {
    label: "Significant",
    bg: "bg-yellow-950",
    text: "text-yellow-300",
    border: "border-yellow-700",
  },
  4: {
    label: "Major",
    bg: "bg-orange-950",
    text: "text-orange-300",
    border: "border-orange-700",
  },
  5: {
    label: "Critical",
    bg: "bg-red-950",
    text: "text-red-300",
    border: "border-red-700",
  },
};

export default function SeverityBadge({ severity }: { severity: number }) {
  const config = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG[1];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}
