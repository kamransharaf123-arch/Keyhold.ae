export async function buildWebsiteContent(table) {
  const [
    settingsRows,
    pageRows,
    sectionRows,
    navRows,
    mediaRows,
    peopleRows,
    testimonialRows,
    faqRows,
    formRows,
    localeRows,
    translationRows,
  ] = await Promise.all([
    table("cms_website_settings", "select=*&limit=1"),
    table("cms_pages", "select=*&status=eq.published&order=route.asc"),
    table("cms_page_sections", "select=*&order=sort_order.asc,section_key.asc"),
    table("cms_navigation_items", "select=*&enabled=eq.true&order=nav_group.asc,sort_order.asc,label.asc"),
    table("cms_media_library", "select=*&order=created_at.desc"),
    table("cms_people", "select=*&status=eq.published&order=sort_order.asc,name.asc"),
    table("cms_testimonials", "select=*&status=eq.published&order=sort_order.asc,created_at.desc"),
    table("cms_faqs", "select=*&status=eq.published&order=scope.asc,sort_order.asc"),
    table("cms_form_copy", "select=*&enabled=eq.true&order=form_key.asc"),
    table("cms_locale_settings", "select=*&enabled=eq.true&order=sort_order.asc,locale.asc"),
    table("cms_translations", "select=*&status=eq.published&order=entity_type.asc,entity_key.asc,locale.asc"),
  ]);

  const settings = settingsRows[0] ?? null;
  const publishedPageIds = new Set(pageRows.map((row) => row.id));
  const pageKeyById = new Map(pageRows.map((row) => [row.id, row.page_key]));

  const websiteSettings = settings ? {
    id: settings.id,
    brandName: settings.brand_name,
    logoText: settings.logo_text,
    logoUrl: settings.logo_url || "",
    logoMarkUrl: settings.logo_mark_url || "",
    logoAlt: settings.logo_alt || settings.brand_name,
    defaultOgImageUrl: settings.default_og_image_url || "",
    projectsMenuLabel: settings.projects_menu_label || "Projects",
    headerCtaLabel: settings.header_cta_label || "Speak to an Advisor",
    headerCtaHref: settings.header_cta_href || "/contact",
    footerTagline: settings.footer_tagline || "",
    footerDisclaimer: settings.footer_disclaimer || "",
    copyrightText: settings.copyright_text || "KeyHold. All rights reserved.",
    locationsLabel: settings.locations_label || "Dubai · UAE",
    globalCta: settings.global_cta || {},
    announcement: settings.announcement || { enabled: false, text: "", href: "" },
    uiCopy: settings.ui_copy || {},
    theme: settings.theme || {},
  } : null;

  const pages = pageRows.map((row) => ({
    id: row.id,
    pageKey: row.page_key,
    route: row.route,
    status: row.status,
    navTitle: row.nav_title,
    eyebrow: row.eyebrow || "",
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle || "",
    heroImageUrl: row.hero_image_url || "",
    heroImageAlt: row.hero_image_alt || "",
    heroVideoUrl: row.hero_video_url || "",
    primaryCtaLabel: row.primary_cta_label || "",
    primaryCtaHref: row.primary_cta_href || "",
    secondaryCtaLabel: row.secondary_cta_label || "",
    secondaryCtaHref: row.secondary_cta_href || "",
    seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "",
    ogImageUrl: row.og_image_url || "",
    settings: row.settings || {},
  }));

  const sections = sectionRows
    .filter((row) => publishedPageIds.has(row.page_id))
    .map((row) => ({
      id: row.id,
      pageId: row.page_id,
      pageKey: pageKeyById.get(row.page_id) || "",
      sectionKey: row.section_key,
      sectionType: row.section_type,
      enabled: Boolean(row.enabled),
      eyebrow: row.eyebrow || "",
      title: row.title || "",
      body: row.body || "",
      imageUrl: row.image_url || "",
      imageAlt: row.image_alt || "",
      ctaLabel: row.cta_label || "",
      ctaHref: row.cta_href || "",
      styleVariant: row.style_variant || "default",
      payload: row.payload || {},
      sortOrder: Number(row.sort_order || 0),
    }));

  const navigation = navRows.map((row) => ({
    id: row.id,
    navGroup: row.nav_group,
    label: row.label,
    href: row.href,
    enabled: Boolean(row.enabled),
    external: Boolean(row.external),
    sortOrder: Number(row.sort_order || 0),
  }));

  const media = mediaRows.map((row) => ({
    id: row.id,
    label: row.label,
    kind: row.kind,
    bucket: row.bucket,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    altText: row.alt_text || "",
    tags: Array.isArray(row.tags) ? row.tags : [],
  }));

  const people = peopleRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    status: row.status,
    name: row.name,
    role: row.role,
    bio: row.bio || "",
    imageUrl: row.image_url || "",
    email: row.email || "",
    phone: row.phone || "",
    linkedinUrl: row.linkedin_url || "",
    sortOrder: Number(row.sort_order || 0),
  }));

  const testimonials = testimonialRows.map((row) => ({
    id: row.id,
    status: row.status,
    name: row.name,
    descriptor: row.descriptor || "",
    quote: row.quote,
    imageUrl: row.image_url || "",
    sourceLabel: row.source_label || "",
    sourceUrl: row.source_url || "",
    sortOrder: Number(row.sort_order || 0),
  }));

  const faqs = faqRows.map((row) => ({
    id: row.id,
    status: row.status,
    scope: row.scope,
    category: row.category || "",
    question: row.question,
    answer: row.answer,
    sortOrder: Number(row.sort_order || 0),
  }));

  const forms = formRows.map((row) => ({
    id: row.id,
    formKey: row.form_key,
    enabled: Boolean(row.enabled),
    title: row.title || "",
    intro: row.intro || "",
    submitLabel: row.submit_label || "Submit",
    successMessage: row.success_message || "Thank you.",
    consentText: row.consent_text || "",
    privacyLabel: row.privacy_label || "Privacy Policy",
    fields: row.fields || {},
    settings: row.settings || {},
  }));

  const locales = localeRows.map((row) => ({
    locale: row.locale,
    label: row.label,
    nativeLabel: row.native_label,
    enabled: Boolean(row.enabled),
    isDefault: Boolean(row.is_default),
    routePrefix: row.route_prefix || "",
    hreflang: row.hreflang || row.locale,
    direction: row.direction === "rtl" ? "rtl" : "ltr",
    fallbackLocale: row.fallback_locale || null,
    sortOrder: Number(row.sort_order || 0),
  }));

  const translations = translationRows.map((row) => ({
    id: row.id,
    entityType: row.entity_type,
    entityKey: row.entity_key,
    locale: row.locale,
    status: row.status,
    data: row.data || {},
    updatedAt: row.updated_at,
  }));

  return {
    enabled: Boolean(websiteSettings || pages.length || navigation.length),
    settings: websiteSettings,
    pages,
    sections,
    navigation,
    media,
    people,
    testimonials,
    faqs,
    forms,
    locales,
    translations,
  };
}
