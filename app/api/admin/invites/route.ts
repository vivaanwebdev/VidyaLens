import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { apiError, requireRole } from "@/lib/school-server";

export async function GET(request: NextRequest) {
  try {
    const { supabase, membership } = await requireRole(request, "admin");
    const { data, error } = await supabase.from("invite_codes").select("id,code,role,expires_at,is_active,created_at").eq("school_id", membership.school_id).order("created_at", { ascending: false });
    if (error) throw error;
    return Response.json({ invites: data });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, membership, user } = await requireRole(request, "admin");
    const { role, expiresAt } = await request.json();
    if (!['admin', 'teacher', 'student'].includes(role)) throw new Error("A valid invite role is required");
    const expiry = new Date(expiresAt);
    if (Number.isNaN(expiry.valueOf()) || expiry <= new Date()) throw new Error("Choose a future expiry date");
    const code = randomBytes(4).toString("hex").toUpperCase();
    const { data, error } = await supabase.from("invite_codes").insert({ school_id: membership.school_id, code, role, expires_at: expiry.toISOString(), created_by: user.id }).select("id,code,role,expires_at,is_active").single();
    if (error) throw error;
    return Response.json({ invite: data }, { status: 201 });
  } catch (error) { return apiError(error); }
}
