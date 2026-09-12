import { NextRequest } from "next/server";
import { apiError, requireRole } from "@/lib/school-server";

export async function GET(request: NextRequest) {
  try {
    const { supabase, membership } = await requireRole(request, "admin");
    const [{ data, error }, { data: academicHealth, error: healthError }] = await Promise.all([
      supabase.from("classes").select("id,class_name,created_at,student_classes(count),teacher_classes(teacher:teachers(id,full_name,email))").eq("school_id", membership.school_id).order("class_name"),
      supabase.rpc("school_academic_health", { p_school_id: membership.school_id }),
    ]);
    if (error) throw error;
    if (healthError) throw healthError;
    return Response.json({ classes: data, academicHealth: Number(academicHealth ?? 0) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, membership } = await requireRole(request, "admin");
    const { className } = await request.json();
    if (typeof className !== "string" || !className.trim()) throw new Error("Class name is required");
    const { data, error } = await supabase.from("classes").insert({ school_id: membership.school_id, class_name: className.trim() }).select("id,class_name").single();
    if (error) throw error;
    return Response.json({ class: data }, { status: 201 });
  } catch (error) { return apiError(error); }
}
