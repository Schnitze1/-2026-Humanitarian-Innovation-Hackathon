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
  "Agriculture and Forestry": "https://upload.wikimedia.org/wikipedia/commons/d/d5/A_farmer_in_Fiji%2C_May_2012._Photo-_DFAT_%2812422885383%29.jpg",
  "Climate Change, Disasters and Risks": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Samoa_%2822452286782%29.jpg",
  "Economy": "https://upload.wikimedia.org/wikipedia/commons/5/51/Vanuatu_Skills_Partnership_%2832717906618%29.jpg",
  "Education": "https://upload.wikimedia.org/wikipedia/commons/a/aa/Students_with_a_disability_take_part_in_The_Inclusive_Education_%28TIE%29_pilot_program_at_Ngele%27ia_Primary_School_in_Nuku%27alofa%2C_Tonga._%2810727442704%29.jpg",
  "Energy": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Samoa_%2822452286782%29.jpg",
  "Environment": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Samoa_%2822452286782%29.jpg",
  "Fisheries and Aquaculture": "https://upload.wikimedia.org/wikipedia/commons/e/e3/U_S_Coast_Guard%2C_Samoa_Ministry_of_Agriculture_and_Fisheries_conduct_bilateral_operations_offshore_Samoa_%289518594%29.jpg",
  "Food": "https://upload.wikimedia.org/wikipedia/commons/7/75/Yams_at_Market_Port_Vila_%284273975974%29.jpg",
  "Gender": "https://upload.wikimedia.org/wikipedia/commons/5/51/Vanuatu_Skills_Partnership_%2832717906618%29.jpg",
  "Health": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Pacific_Partnership_24-1-_Community_Health_Clinic_Eye_Exam_%288138531%29.jpg",
  "Information, Communication and Technology": "https://upload.wikimedia.org/wikipedia/commons/a/aa/Students_with_a_disability_take_part_in_The_Inclusive_Education_%28TIE%29_pilot_program_at_Ngele%27ia_Primary_School_in_Nuku%27alofa%2C_Tonga._%2810727442704%29.jpg",
  "Ocean and Maritime": "https://upload.wikimedia.org/wikipedia/commons/e/e3/U_S_Coast_Guard%2C_Samoa_Ministry_of_Agriculture_and_Fisheries_conduct_bilateral_operations_offshore_Samoa_%289518594%29.jpg",
  "Population": "https://upload.wikimedia.org/wikipedia/commons/7/75/Yams_at_Market_Port_Vila_%284273975974%29.jpg",
  "Social and Culture": "https://upload.wikimedia.org/wikipedia/commons/d/d5/A_farmer_in_Fiji%2C_May_2012._Photo-_DFAT_%2812422885383%29.jpg"
};
