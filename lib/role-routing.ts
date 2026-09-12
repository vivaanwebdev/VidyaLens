import { supabase } from "@/lib/supabase";

export type ApplicationRole = "admin" | "teacher" | "student";

export const roleDashboard = (role: ApplicationRole) => `/${role}/dashboard`;

export async function resolveApplicationRole(userId: string): Promise<ApplicationRole | null> {
  const [{ data: admin }, { data: teacher }, { data: student }] = await Promise.all([
    supabase.from("school_admins").select("id").eq("user_id", userId).maybeSingle(),
    supabase.from("teachers").select("id").eq("user_id", userId).maybeSingle(),
    supabase.from("students").select("id").eq("user_id", userId).maybeSingle(),
  ]);
  if (admin) return "admin";
  if (teacher) return "teacher";
  if (student) return "student";
  return null;
}
