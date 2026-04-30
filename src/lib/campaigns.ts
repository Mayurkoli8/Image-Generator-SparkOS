export const campaignTypes = [
  { value: "festival_greeting", label: "Festival Greeting" },
  { value: "new_year", label: "New Year Greeting" },
  { value: "property_launch", label: "Property Launch" },
  { value: "offer_promotion", label: "Offer Promotion" },
  { value: "site_visit_invitation", label: "Site Visit Invitation" },
  { value: "possession_update", label: "Possession Update" },
  { value: "milestone_announcement", label: "Milestone Announcement" },
  { value: "brand_awareness", label: "Brand Awareness" },
  { value: "testimonial", label: "Testimonial Post" },
  { value: "project_highlight", label: "Project Highlight" },
  { value: "construction_progress", label: "Construction Progress" },
] as const;

export const aspectRatios = [
  { value: "1:1", label: "Square 1:1", width: 1080, height: 1080 },
  { value: "4:5", label: "Portrait 4:5", width: 1080, height: 1350 },
  { value: "9:16", label: "Story 9:16", width: 1080, height: 1920 },
] as const;

export function getCampaignLabel(value: string) {
  return campaignTypes.find((item) => item.value === value)?.label || value;
}

export function getAspectRatioConfig(value: string) {
  return aspectRatios.find((item) => item.value === value) || aspectRatios[0];
}
