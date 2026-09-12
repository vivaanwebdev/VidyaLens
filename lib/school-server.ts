import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export function getRequestSupabase(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Missing authorization token");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function requireRole(request: NextRequest, role: "admin" | "teacher") {
  const supabase = getRequestSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthenticated");
  const table = role === "admin" ? "school_admins" : "teachers";
  const { data: membership, error: membershipError } = await supabase
    .from(table)
    .select("id,school_id,user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) throw new Error("Forbidden");
  return { supabase, user, membership };
}

export function apiError(error: unknown) {
  // Supabase PostgREST errors are plain objects in some runtime paths.
  const message = error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
      ? error.message
      : "Unexpected server error";
  const status = message === "Unauthenticated" || message === "Missing authorization token" ? 401 : message === "Forbidden" ? 403 : 400;
  return Response.json({ error: message }, { status });
}
