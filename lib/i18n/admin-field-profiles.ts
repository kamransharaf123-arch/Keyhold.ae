import type { TranslationFieldDefinition } from "@/components/admin/entity-translation-panel";
import type { TranslationEntityType } from "@/types/localization";

export const translationFieldProfiles: Partial<Record<TranslationEntityType, TranslationFieldDefinition[]>> = {
  project: [
    { key: "title", label: "Project title" },
    { key: "location", label: "Location label" },
    { key: "shortDescription", label: "Short description", kind: "textarea" },
    { key: "overview", label: "Overview", kind: "textarea" },
    { key: "bedroomsLabel", label: "Bedrooms label" },
    { key: "bathroomsLabel", label: "Bathrooms label" },
    { key: "propertyTypes", label: "Property types", kind: "array" },
    { key: "handoverLabel", label: "Handover label" },
    { key: "amenities", label: "Amenities", kind: "array" },
    { key: "keyFacts", label: "Key facts", kind: "json" },
    { key: "seo", label: "SEO title / description", kind: "json" },
  ],
  developer: [
    { key: "name", label: "Developer name" },
    { key: "summary", label: "Summary", kind: "textarea" },
    { key: "location", label: "Location label" },
  ],
  area: [
    { key: "name", label: "Area name" },
    { key: "summary", label: "Area summary", kind: "textarea" },
    { key: "highlights", label: "Highlights", kind: "array" },
  ],
  "construction-update": [
    { key: "statusLabel", label: "Status label" },
    { key: "updatedAtLabel", label: "Update date label" },
    { key: "summary", label: "Summary", kind: "textarea" },
    { key: "milestones", label: "Milestones", kind: "array" },
  ],
  insight: [
    { key: "category", label: "Category" },
    { key: "title", label: "Title" },
    { key: "excerpt", label: "Excerpt", kind: "textarea" },
    { key: "body", label: "Article body", kind: "textarea" },
  ],
  service: [
    { key: "title", label: "Service title" },
    { key: "text", label: "Service description", kind: "textarea" },
  ],
  unit: [
    { key: "propertyType", label: "Property type" },
    { key: "viewLabel", label: "View label" },
  ],
  "payment-milestone": [
    { key: "label", label: "Milestone label" },
    { key: "timing", label: "Timing" },
    { key: "note", label: "Note", kind: "textarea" },
  ],
  "floor-plan": [
    { key: "label", label: "Floor-plan label" },
    { key: "propertyType", label: "Property type" },
  ],
  document: [{ key: "label", label: "Document label" }],
  "intelligence-profile": [
    { key: "developerDeliveryRationale", label: "Developer delivery rationale", kind: "textarea" },
    { key: "liquidityRationale", label: "Liquidity rationale", kind: "textarea" },
    { key: "scoreDimensions", label: "Score dimensions", kind: "json" },
    { key: "riskDimensions", label: "Risk dimensions", kind: "json" },
    { key: "viewIntelligence", label: "View intelligence", kind: "json" },
    { key: "verdict", label: "KeyHold verdict", kind: "json" },
  ],
  "intelligence-source": [
    { key: "label", label: "Source label" },
    { key: "note", label: "Source note", kind: "textarea" },
  ],
  person: [
    { key: "role", label: "Role" },
    { key: "bio", label: "Biography", kind: "textarea" },
  ],
  testimonial: [
    { key: "descriptor", label: "Descriptor" },
    { key: "quote", label: "Quote", kind: "textarea" },
    { key: "sourceLabel", label: "Source label" },
  ],
  faq: [
    { key: "category", label: "Category" },
    { key: "question", label: "Question" },
    { key: "answer", label: "Answer", kind: "textarea" },
  ],
};
