import { NextRequest } from "next/server";
import { apiError, getRequestSupabase } from "@/lib/school-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = getRequestSupabase(request);
    const { code, fullName, classId } = await request.json();
    if (!code?.trim() || !fullName?.trim()) throw new Error("Invite code and full name are required");
    const { data, error } = await supabase.rpc("redeem_invite_code", { p_code: code, p_full_name: fullName.trim(), p_class_id: classId || null });
    if (error) throw error;
    return Response.json({ membership: data });
  } catch (error) { return apiError(error); }
}
