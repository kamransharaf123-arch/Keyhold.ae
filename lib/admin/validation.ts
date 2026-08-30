const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function requiredText(formData: FormData, key: string, max = 5000): string {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`${key} is required.`);
  if (value.length > max) throw new Error(`${key} is too long.`);
  return value;
}

export function optionalText(formData: FormData, key: string, max = 5000): string | null {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return null;
  if (value.length > max) throw new Error(`${key} is too long.`);
  return value;
}

export function slugValue(formData: FormData, key = "slug"): string {
  const slug = requiredText(formData, key, 120).toLowerCase();
  if (!SLUG_RE.test(slug)) throw new Error(`${key} must use lowercase letters, numbers and hyphens only.`);
  return slug;
}

export function numberValue(
  formData: FormData,
  key: string,
  options: { nullable?: boolean; min?: number; max?: number; integer?: boolean } = {},
): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw && options.nullable) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`${key} must be a valid number.`);
  if (options.integer && !Number.isInteger(value)) throw new Error(`${key} must be a whole number.`);
  if (options.min !== undefined && value < options.min) throw new Error(`${key} must be at least ${options.min}.`);
  if (options.max !== undefined && value > options.max) throw new Error(`${key} must be at most ${options.max}.`);
  return value;
}

export function booleanValue(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true" || formData.get(key) === "1";
}

export function commaList(formData: FormData, key: string): string[] {
  return String(formData.get(key) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function numberList(formData: FormData, key: string): number[] {
  return commaList(formData, key)
    .map(Number)
    .filter((value) => Number.isFinite(value) && value >= 0);
}

export function jsonValue<T>(formData: FormData, key: string, fallback: T): T {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`${key} must contain valid JSON.`);
  }
}

export function enumValue<T extends readonly string[]>(formData: FormData, key: string, allowed: T): T[number] {
  const value = requiredText(formData, key, 100);
  if (!allowed.includes(value)) throw new Error(`${key} has an invalid value.`);
  return value as T[number];
}

export function safeId(formData: FormData, key: string): string {
  const value = requiredText(formData, key, 80);
  if (!/^[0-9a-f-]{32,40}$/i.test(value)) throw new Error(`${key} is invalid.`);
  return value;
}
