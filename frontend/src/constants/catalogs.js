/**
 * Mirrors backend/profiles.py catalogs for Setup dropdowns.
 * Keep in sync when the backend catalog changes.
 */
export const NGO_PROFILES = [
  {
    value: "service_welfare_health",
    label: "Service & Welfare — Health & Disability",
  },
  {
    value: "service_welfare_social",
    label: "Service & Welfare — Social Services",
  },
  {
    value: "community_arts",
    label: "Community & Grassroots — Arts & Cultural",
  },
  {
    value: "community_sports",
    label: "Community & Grassroots — Recreation & Sports",
  },
  {
    value: "development_education",
    label: "Development — Education & Training",
  },
  {
    value: "development_economic",
    label: "Development — Economic Empowerment",
  },
  {
    value: "environmental_conservation",
    label: "Environmental — Conservation",
  },
  {
    value: "environmental_sustainability",
    label: "Environmental — Sustainability",
  },
  {
    value: "advocacy_human_rights",
    label: "Advocacy & Human Rights",
  },
  {
    value: "general",
    label: "General NGO",
  },
];

export const DATASET_TOPICS = [
  "Agriculture and Forestry",
  "Climate Change, Disasters and Risks",
  "Economy",
  "Education",
  "Energy",
  "Environment",
  "Fisheries and Aquaculture",
  "Food",
  "Gender",
  "Health",
  "Information, Communication and Technology",
  "Ocean and Maritime",
  "Population",
  "Social and Culture",
];

export const REPORT_TYPES = [
  { value: "donor_quarterly", label: "Donor quarterly" },
  { value: "community_update", label: "Community update" },
  { value: "internal_brief", label: "Internal brief" },
  { value: "public_audit", label: "Public audit" },
];

export const AUDIENCES = [
  { value: "donor", label: "Donor" },
  { value: "community", label: "Community / public" },
  { value: "internal", label: "Internal" },
];
