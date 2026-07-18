/**
 * Mirrors backend/profiles.py catalogs for Setup dropdowns.
 * Keep in sync when the backend catalog changes.
 */
export const NGO_PROFILES = [
  { value: "health_large_international", label: "Health (Large International)" },
  { value: "health_medium_regional", label: "Health (Medium Regional)" },
  { value: "health_small_niche_disability", label: "Health (Small Niche - Disability)" },
  { value: "health_small_niche_mental", label: "Health (Small Niche - Mental Health)" },
  { value: "health_small_niche_nutrition", label: "Health (Small Niche - Nutrition)" },
  { value: "service_welfare_social", label: "Service & Welfare (Social Services)" },
  { value: "community_arts", label: "Community & Grassroots (Arts & Cultural)" },
  { value: "community_sports", label: "Community & Grassroots (Recreation & Sports)" },
  { value: "development_education", label: "Development (Education & Training)" },
  { value: "development_economic", label: "Development (Economic Empowerment)" },
  { value: "environmental_conservation", label: "Environmental (Conservation)" },
  { value: "environmental_sustainability", label: "Environmental (Sustainability)" },
  { value: "advocacy_human_rights", label: "Advocacy & Human Rights" },
  { value: "general", label: "General Non-Governmental Organization" },
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

export const TOPIC_IMAGES = {
  "Agriculture and Forestry": "https://loremflickr.com/800/600/fiji,agriculture/all",
  "Climate Change, Disasters and Risks": "https://loremflickr.com/800/600/samoa,climate/all",
  "Economy": "https://loremflickr.com/800/600/vanuatu,economy/all",
  "Education": "https://loremflickr.com/800/600/tonga,education/all",
  "Energy": "https://loremflickr.com/800/600/pacific,energy/all",
  "Environment": "https://loremflickr.com/800/600/fiji,environment/all",
  "Fisheries and Aquaculture": "https://loremflickr.com/800/600/samoa,fishing/all",
  "Food": "https://loremflickr.com/800/600/vanuatu,food/all",
  "Gender": "https://loremflickr.com/800/600/tonga,women/all",
  "Health": "https://loremflickr.com/800/600/pacific,health/all",
  "Information, Communication and Technology": "https://loremflickr.com/800/600/fiji,technology/all",
  "Ocean and Maritime": "https://loremflickr.com/800/600/samoa,ocean/all",
  "Population": "https://loremflickr.com/800/600/vanuatu,people/all",
  "Social and Culture": "https://loremflickr.com/800/600/tonga,culture/all"
};
