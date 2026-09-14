import { NextRequest } from "next/server";
import { apiError, getRequestSupabase } from "@/lib/school-server";

export async function POST(request: NextRequest) {
  try {
    const { schoolName, schoolCode } = await request.json();
    if (typeof schoolName !== "string" || typeof schoolCode !== "string") {
      throw new Error("School name and school code are required");
    }
    const supabase = getRequestSupabase(request);
    const { data, error } = await supabase.rpc("register_school", {
      p_school_name: schoolName,
      p_school_code: schoolCode,
    });
    if (error) throw error;
    return Response.json({ school: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
