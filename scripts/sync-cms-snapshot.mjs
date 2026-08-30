import { writeFile } from "node:fs/promises";
import path from "node:path";
import { buildWebsiteContent } from "./cms-website-snapshot.mjs";

const outPath = path.join(process.cwd(), "data", "cms-snapshot.json");
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const required = process.env.CMS_REQUIRED === "true";

const fallback = {
  enabled: false,
  generatedAt: null,
  source: "demo-fallback",
  websiteEnabled: false,
  website: null,
  developers: [],
  areas: [],
  projects: [],
  constructionUpdates: [],
  intelligenceProfiles: [],
  insights: [],
  services: [],
  siteSettings: null,
};

function fail(message) {
  if (required) throw new Error(message);
  console.warn(`[cms-sync] ${message} Using committed demo fallback.`);
}

if (!supabaseUrl || !serviceKey) {
  fail("Supabase CMS environment variables are not configured.");
  process.exit(0);
}

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
async function table(name, query = "select=*") {
  const response = await fetch(`${supabaseUrl}/rest/v1/${name}?${query}`, { headers });
  if (!response.ok) throw new Error(`${name}: ${response.status} ${await response.text()}`);
  return response.json();
}

function by(items, key) {
  const map = new Map();
  for (const item of items) {
    const value = item[key];
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(item);
  }
  return map;
}

function sortByOrder(items) {
  return [...items].sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
}

function validStatus(value, allowed, label) {
  if (!allowed.includes(value)) throw new Error(`${label} has unsupported value: ${value}`);
  return value;
}

try {
  const [developerRows, areaRows, projectRows, imageRows, unitRows, milestoneRows, floorRows, documentRows, updateRows, intelligenceRows, sourceRows, insightRows, serviceRows, settingsRows] = await Promise.all([
    table("cms_developers", "select=*&status=eq.published&order=name.asc"),
    table("cms_areas", "select=*&status=eq.published&order=name.asc"),
    table("cms_projects", "select=*&status=eq.published&order=published_at.desc.nullslast,title.asc"),
    table("cms_project_images", "select=*&order=sort_order.asc"),
    table("cms_units", "select=*&order=sort_order.asc,unit_number.asc"),
    table("cms_payment_milestones", "select=*&order=sort_order.asc"),
    table("cms_floor_plans", "select=*&order=sort_order.asc"),
    table("cms_documents", "select=*&order=sort_order.asc"),
    table("cms_construction_updates", "select=*&status=eq.published&order=published_at.desc"),
    table("cms_intelligence_profiles", "select=*"),
    table("cms_intelligence_sources", "select=*&order=last_checked_at.desc"),
    table("cms_insights", "select=*&status=eq.published&order=published_at.desc"),
    table("cms_services", "select=*&status=eq.published&order=sort_order.asc,title.asc"),
    table("cms_site_settings", "select=*&limit=1"),
  ]);

  if (projectRows.length === 0) throw new Error("CMS has no published projects yet.");
  if (developerRows.length === 0) throw new Error("CMS has no published developers yet.");
  if (areaRows.length === 0) throw new Error("CMS has no published areas yet.");

  const developerById = new Map(developerRows.map((row) => [row.id, row]));
  const areaById = new Map(areaRows.map((row) => [row.id, row]));
  const imagesByProject = by(imageRows, "project_id");
  const unitsByProject = by(unitRows, "project_id");
  const milestonesByProject = by(milestoneRows, "project_id");
  const floorsByProject = by(floorRows, "project_id");
  const documentsByProject = by(documentRows, "project_id");
  const sourcesByProject = by(sourceRows, "project_id");
  const projectById = new Map(projectRows.map((row) => [row.id, row]));
  const publishedIds = new Set(projectRows.map((row) => row.id));

  const developers = developerRows.map((row) => ({
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    location: row.location,
    verifiedFactsOnly: Boolean(row.verified_facts_only),
  }));

  const areas = areaRows.map((row) => ({
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    emirate: row.emirate,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    mapPosition: { x: Number(row.map_x), y: Number(row.map_y) },
  }));

  const projects = projectRows.map((row) => {
    const developer = developerById.get(row.developer_id);
    const area = areaById.get(row.area_id);
    if (!developer) throw new Error(`Published project ${row.slug} references an unpublished/missing developer.`);
    if (!area) throw new Error(`Published project ${row.slug} references an unpublished/missing area.`);

    const paymentPlan = sortByOrder(milestonesByProject.get(row.id) || []).map((item) => ({
      id: item.id,
      label: item.label,
      percentage: Number(item.percentage),
      timing: item.timing,
      ...(item.note ? { note: item.note } : {}),
    }));
    if (row.category === "Off-Plan" && paymentPlan.length > 0) {
      const total = paymentPlan.reduce((sum, item) => sum + item.percentage, 0);
      if (Math.abs(total - 100) > 0.001) throw new Error(`${row.slug} payment plan totals ${total}% instead of 100%.`);
    }

    const projectImages = sortByOrder(imagesByProject.get(row.id) || []).map((item) => ({ src: item.public_url, alt: item.alt_text, category: item.category }));
    const hero = row.hero_image_url || projectImages[0]?.src;
    if (!hero) throw new Error(`Published project ${row.slug} has no hero image.`);

    return {
      slug: row.slug,
      title: row.title,
      category: validStatus(row.category, ["Off-Plan", "Ready", "Short-Term", "Long-Term"], `${row.slug} category`),
      developerSlug: developer.slug,
      areaSlug: area.slug,
      location: row.location,
      shortDescription: row.short_description,
      overview: row.overview,
      heroImage: hero,
      images: projectImages.length ? projectImages : [{ src: hero, alt: `${row.title} hero image`, category: "Exterior" }],
      priceFromAed: row.price_from_aed === null ? null : Number(row.price_from_aed),
      rentalPriceFromAed: row.rental_price_from_aed === null ? null : Number(row.rental_price_from_aed),
      ...(row.rental_period ? { rentalPeriod: row.rental_period } : {}),
      bedroomsLabel: row.bedrooms_label,
      bedrooms: Array.isArray(row.bedrooms) ? row.bedrooms.map(Number) : [],
      ...(row.bathrooms_label ? { bathroomsLabel: row.bathrooms_label } : {}),
      propertyTypes: Array.isArray(row.property_types) ? row.property_types : [],
      sizeFromSqft: row.size_from_sqft === null ? null : Number(row.size_from_sqft),
      sizeToSqft: row.size_to_sqft === null ? null : Number(row.size_to_sqft),
      handoverLabel: row.handover_label,
      ...(row.handover_date ? { handoverDate: row.handover_date } : {}),
      completionStatus: validStatus(row.completion_status, ["pre-launch", "under-construction", "ready"], `${row.slug} completion status`),
      amenities: Array.isArray(row.amenities) ? row.amenities : [],
      paymentPlan,
      floorPlans: sortByOrder(floorsByProject.get(row.id) || []).map((item) => ({ id: item.id, label: item.label, bedrooms: Number(item.bedrooms), propertyType: item.property_type, sizeFromSqft: Number(item.size_from_sqft), ...(item.size_to_sqft !== null ? { sizeToSqft: Number(item.size_to_sqft) } : {}), image: item.image_url })),
      units: sortByOrder(unitsByProject.get(row.id) || []).map((item) => ({ id: item.id, unitNumber: item.unit_number, floor: Number(item.floor), bedrooms: Number(item.bedrooms), bathrooms: Number(item.bathrooms), propertyType: item.property_type, sizeSqft: Number(item.size_sqft), view: item.view_label, priceAed: item.price_aed === null ? null : Number(item.price_aed), availability: validStatus(item.availability, ["available", "reserved", "sold", "unknown"], `${row.slug} unit availability`), lastVerifiedAt: item.last_verified_at })),
      documents: sortByOrder(documentsByProject.get(row.id) || []).map((item) => ({ id: item.id, label: item.label, kind: item.kind, availability: item.availability, ...(item.public_url ? { href: item.public_url } : {}) })),
      regulatory: row.regulatory || { registrationStatus: "pending-verification" },
      availabilityLastVerifiedAt: row.availability_last_verified_at,
      publishedAt: row.published_at || row.updated_at,
      featured: Boolean(row.featured),
      ...(row.construction_progress !== null ? { constructionProgress: Number(row.construction_progress) } : {}),
      discovery: row.discovery || { investmentGoals: [], lifestyleTags: [], keywords: [] },
      ...(row.investment ? { investment: row.investment } : {}),
      keyFacts: Array.isArray(row.key_facts) ? row.key_facts : [],
    };
  });

  const constructionUpdates = updateRows.filter((row) => publishedIds.has(row.project_id)).map((row) => {
    const project = projectById.get(row.project_id);
    const area = project ? areaById.get(project.area_id) : null;
    return {
      slug: row.slug,
      projectSlug: project.slug,
      project: project.title,
      location: area?.name || project.location,
      progress: Number(row.progress),
      status: row.status_label,
      updatedAt: row.updated_at_label,
      publishedAt: row.published_at,
      image: row.image_url || project.hero_image_url,
      summary: row.summary,
      milestones: Array.isArray(row.milestones) ? row.milestones : [],
    };
  });

  const intelligenceProfiles = intelligenceRows.filter((row) => publishedIds.has(row.project_id)).map((row) => {
    const project = projectById.get(row.project_id);
    const sources = (sourcesByProject.get(row.project_id) || []).map((source) => ({
      id: source.source_key,
      label: source.label,
      category: source.category,
      status: source.status,
      lastCheckedAt: source.last_checked_at,
      ...(source.url ? { url: source.url } : {}),
      ...(source.note ? { note: source.note } : {}),
    }));
    if (row.data_status === "verified" && sources.filter((source) => source.status === "verified").length === 0) {
      throw new Error(`${project.slug} is marked verified but has no verified intelligence source.`);
    }
    return {
      projectSlug: project.slug,
      dataStatus: row.data_status,
      lastReviewedAt: row.last_reviewed_at,
      scoreDimensions: row.score_dimensions || [],
      riskDimensions: row.risk_dimensions || [],
      developerDeliveryScore: Number(row.developer_delivery_score),
      developerDeliveryRationale: row.developer_delivery_rationale,
      liquidityScore: Number(row.liquidity_score),
      liquidityRationale: row.liquidity_rationale,
      priceHistory: row.price_history || [],
      comparables: row.comparables || [],
      supplyPipeline: row.supply_pipeline || [],
      viewIntelligence: row.view_intelligence || [],
      verdict: row.verdict,
      sources,
    };
  });

  const insights = insightRows.map((row) => ({
    slug: row.slug,
    category: row.category,
    title: row.title,
    excerpt: row.excerpt,
    date: new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "Asia/Dubai" }).format(new Date(row.published_at)),
  }));

  const services = serviceRows.map((row) => ({ slug: row.slug, title: row.title, text: row.text }));
  let websiteEnabled = false;
  let website = null;
  try {
    website = await buildWebsiteContent(table);
    websiteEnabled = website.enabled;
  } catch (error) {
    console.warn(`[cms-sync] Website Studio tables unavailable (${error instanceof Error ? error.message : String(error)}). Website Studio disabled for this build.`);
    websiteEnabled = false;
    website = null;
  }

  const settings = settingsRows[0];
  const siteSettings = settings ? {
    name: settings.company_name,
    email: settings.email,
    phone: settings.phone || "",
    location: settings.location,
    addressLine: settings.address_line || "",
    company: { legalName: settings.legal_name, orn: settings.orn || "", tradeLicense: settings.trade_license || "" },
    socials: Array.isArray(settings.socials) ? settings.socials : [],
    googleReviews: settings.google_reviews || { rating: null, reviewCount: null, href: "" },
    languages: Array.isArray(settings.languages) && settings.languages.length ? settings.languages : ["EN"],
  } : null;

  const snapshot = { enabled: true, generatedAt: new Date().toISOString(), source: "supabase-cms", websiteEnabled, website, developers, areas, projects, constructionUpdates, intelligenceProfiles, insights, services, siteSettings };
  await writeFile(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`[cms-sync] Wrote ${projects.length} projects, ${developers.length} developers, ${areas.length} areas, ${constructionUpdates.length} updates and ${intelligenceProfiles.length} intelligence profiles.`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
  if (!required) await writeFile(outPath, `${JSON.stringify(fallback, null, 2)}\n`, "utf8");
}
