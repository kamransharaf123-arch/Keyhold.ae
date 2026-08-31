import type { ClientCurrency, ClientLocale } from "@/types/client-portal";

export function cleanText(value: FormDataEntryValue | null, max = 160): string {
  return String(value ?? "").trim().slice(0, max);
}

export function cleanEmail(value: FormDataEntryValue | null): string {
  const email = cleanText(value, 254).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  return email;
}

export function cleanPassword(value: FormDataEntryValue | null): string {
  const password = String(value ?? "");
  if (password.length < 10 || password.length > 128) throw new Error("Password must be between 10 and 128 characters.");
  return password;
}

export function cleanLocale(value: FormDataEntryValue | null): ClientLocale {
  return String(value) === "fr" ? "fr" : "en";
}

export function cleanCurrency(value: FormDataEntryValue | null): ClientCurrency {
  const currency = String(value ?? "AED").toUpperCase();
  return ["AED","USD","EUR","GBP","CHF"].includes(currency) ? currency as ClientCurrency : "AED";
}

export function cleanUuid(value: FormDataEntryValue | null, label = "ID"): string {
  const text = cleanText(value, 64);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
    throw new Error(`${label} is invalid.`);
  }
  return text;
}

export function cleanMoney(value: FormDataEntryValue | null, label: string): number {
  const parsed = Number(String(value ?? "0"));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10_000_000_000) throw new Error(`${label} is invalid.`);
  return Math.round(parsed);
}

export function cleanJsonObject(value: string, maxBytes = 64_000): Record<string, unknown> {
  if (Buffer.byteLength(value, "utf8") > maxBytes) throw new Error("Saved analysis is too large.");
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Saved analysis payload is invalid.");
  return parsed as Record<string, unknown>;
}
