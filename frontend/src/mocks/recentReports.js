/**
 * Isolated demo data only — not used as a fallback for API failures.
 * There is no report-history endpoint on the backend.
 */
export const MOCK_RECENT_REPORTS = [
  {
    id: "demo-rep-1",
    programName: "Water Access — Rift Valley",
    audience: "Donor",
    status: "review",
    updatedLabel: "Yesterday",
  },
  {
    id: "demo-rep-2",
    programName: "Community Health Outreach",
    audience: "Community",
    status: "verified",
    updatedLabel: "3 days ago",
  },
  {
    id: "demo-rep-3",
    programName: "School Meals Q1 Summary",
    audience: "Internal",
    status: "warning",
    updatedLabel: "Last week",
  },
];
