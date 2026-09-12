import { NextRequest } from "next/server";
import { apiError, requireRole } from "@/lib/school-server";

type AdminStudentRow = { student_id: number; class_id: number; student_name: string };

export async function GET(request: NextRequest) {
  try {
    const { supabase, membership } = await requireRole(request, "admin");
    const [{ data: teachers, error: teacherError }, { data: studentRows, error: studentError }] = await Promise.all([
      supabase.from("teachers").select("id,full_name,email,teacher_classes(class_id)").eq("school_id", membership.school_id).order("full_name"),
      supabase.rpc("admin_students_by_class", { p_school_id: membership.school_id }),
    ]);
    if (teacherError) throw teacherError;
    if (studentError) throw studentError;
    const students = ((studentRows ?? []) as AdminStudentRow[]).map((row) => ({
      student_id: row.student_id,
      class_id: row.class_id,
      student: { id: row.student_id, name: row.student_name },
    }));
    return Response.json({ teachers, students });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireRole(request, "admin");
    const { teacherId, classId } = await request.json();
    if (!teacherId || !classId) throw new Error("Teacher and class are required");
    const { error } = await supabase.from("teacher_classes").upsert({ teacher_id: teacherId, class_id: classId }, { onConflict: "teacher_id,class_id" });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase } = await requireRole(request, "admin");
    const { studentId, classId } = await request.json();
    if (!studentId || !classId) throw new Error("Student and class are required");
    const { error } = await supabase.from("student_classes").upsert({ student_id: studentId, class_id: classId }, { onConflict: "student_id" });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
