import { NextRequest } from "next/server";
import { apiError, requireRole } from "@/lib/school-server";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireRole(request, "teacher");
    const { classId, subject, examDate } = await request.json();
    if (!classId || typeof subject !== "string" || !subject.trim() || !examDate) throw new Error("Class, subject, and exam date are required");
    const { data, error } = await supabase.rpc("schedule_class_exam", {
      p_class_id: Number(classId), p_subject: subject.trim(), p_exam_date: examDate,
    });
    if (error) throw error;
    return Response.json({ updatedStudents: Number(data ?? 0) });
  } catch (error) { return apiError(error); }
}
