import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "poll all RSS feeds",
  { minutes: 3 },
  internal.ingest.pollAllFeeds
);

crons.interval(
  "generate situation summary",
  { minutes: 15 },
  internal.summaryAction.generateSummary
);

crons.interval(
  "poll flight news",
  { minutes: 10 },
  internal.flightsIngest.pollFlightNews
);

crons.interval(
  "generate flight status summary",
  { minutes: 15 },
  internal.flightsIngest.generateFlightSummary
);

export default crons;
