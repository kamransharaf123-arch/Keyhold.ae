import { saveFriendlyTranslationAction } from "@/app/admin/localization-actions";
import { AdminCard, Field, inputClass, selectClass, textareaClass } from "@/components/admin/admin-ui";
import type { TranslationEntityType } from "@/types/localization";

export type TranslationFieldDefinition = {
  key: string;
  label: string;
  kind?: "text" | "textarea" | "array" | "json";
  hint?: string;
};

export function EntityTranslationPanel({
  entityType,
  entityKey,
  locale = "fr",
  current = {},
  fields,
  returnTo,
  status = "draft",
}: {
  entityType: TranslationEntityType;
  entityKey: string;
  locale?: string;
  current?: Record<string, unknown>;
  fields: TranslationFieldDefinition[];
  returnTo: string;
  status?: "draft" | "published";
}) {
  return (
    <AdminCard eyebrow={locale === "fr" ? "Français" : locale.toUpperCase()} title="Translation">
      <form action={saveFriendlyTranslationAction} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="entity_type" value={entityType} />
        <input type="hidden" name="entity_key" value={entityKey} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="return_to" value={returnTo} />
        <input type="hidden" name="field_schema" value={JSON.stringify(fields.map(({ key, kind = "text" }) => ({ key, kind })))} />
        {fields.map((field) => {
          const value = current[field.key];
          const rendered = field.kind === "array"
            ? (Array.isArray(value) ? value.join("\n") : "")
            : field.kind === "json"
              ? JSON.stringify(value ?? {}, null, 2)
              : typeof value === "string" ? value : "";
          const control = field.kind === "textarea" || field.kind === "array" || field.kind === "json"
            ? <textarea className={`${textareaClass} ${field.kind === "json" ? "min-h-48 font-mono text-xs" : ""}`} name={`tr__${field.key}`} defaultValue={rendered} />
            : <input className={inputClass} name={`tr__${field.key}`} defaultValue={rendered} />;
          return <div key={field.key} className={field.kind === "textarea" || field.kind === "array" || field.kind === "json" ? "md:col-span-2" : ""}><Field label={field.label} hint={field.hint}>{control}</Field></div>;
        })}
        <Field label="Translation status"><select className={selectClass} name="status" defaultValue={status}><option value="draft">Draft</option><option value="published">Published</option></select></Field>
        <div className="flex items-end justify-end"><button className="button button-dark">Save French translation</button></div>
      </form>
      <p className="mt-4 text-xs leading-6 text-[var(--color-stone)]">Leave a French field empty to fall back safely to the English canonical value. This avoids incomplete pages or fabricated automatic translations.</p>
    </AdminCard>
  );
}
