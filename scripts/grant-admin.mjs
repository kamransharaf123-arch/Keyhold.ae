const email = process.argv[2]?.trim().toLowerCase();
const role = process.argv[3]?.trim() || "owner";
const allowedRoles = new Set(["owner", "admin", "editor", "viewer"]);
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!email) throw new Error("Usage: npm run cms:grant-admin -- admin@example.com [owner|admin|editor|viewer]");
if (!allowedRoles.has(role)) throw new Error(`Unsupported role: ${role}`);
if (!url || !serviceKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };
const usersResponse = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1000`, { headers });
if (!usersResponse.ok) throw new Error(`Could not list Auth users: ${usersResponse.status} ${await usersResponse.text()}`);
const payload = await usersResponse.json();
const users = Array.isArray(payload.users) ? payload.users : [];
const user = users.find((item) => String(item.email || "").toLowerCase() === email);
if (!user) throw new Error(`No Supabase Auth user found for ${email}. Create the user first in Supabase Authentication.`);

const response = await fetch(`${url}/rest/v1/admin_profiles?on_conflict=user_id`, {
  method: "POST",
  headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
  body: JSON.stringify({ user_id: user.id, role, is_active: true }),
});
if (!response.ok) throw new Error(`Could not grant admin role: ${response.status} ${await response.text()}`);
console.log(`Granted KeyHold CMS role ${role} to ${email}.`);
