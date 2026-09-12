import { NextRequest } from "next/server";
import { apiError, requireRole } from "@/lib/school-server";

export async function GET(request: NextRequest) {
  try {
    const { supabase, membership } = await requireRole(request, "teacher");
    const { data: assignments, error: assignmentError } = await supabase
      .from("teacher_classes")
      .select("class:classes(id,class_name,student_classes(student_id,student:students(id,name,user_id,subjects(score),timetable_entries(id))))")
      .eq("teacher_id", membership.id);
    if (assignmentError) throw assignmentError;
    const studentIds = (assignments ?? []).flatMap((assignment) =>
      ((assignment.class as unknown as { student_classes: { student_id: number }[] } | null)?.student_classes ?? []).map((student) => student.student_id),
    );
    const { data: completionRows, error: completionError } = studentIds.length
      ? await supabase.from("study_session_completions").select("student_id,completed").in("student_id", studentIds)
      : { data: [], error: null };
    if (completionError) throw completionError;
    return Response.json({ classes: assignments ?? [], completions: completionRows ?? [] });
  } catch (error) { return apiError(error); }
}
