import { NextRequest } from "next/server";
import { apiError, requireRole } from "@/lib/school-server";

export async function GET(request: NextRequest) {
  try {
    const { supabase, membership } = await requireRole(request, "teacher");
    const { data: assignments, error: assignmentError } = await supabase
      .from("teacher_classes")
      .select("class:classes(id,class_name,student_classes(student_id,student:students(id,name,user_id,timetable_entries(id))))")
      .eq("teacher_id", membership.id);
    if (assignmentError) throw assignmentError;
    const studentIds = (assignments ?? []).flatMap((assignment) =>
      ((assignment.class as unknown as { student_classes: { student_id: number }[] } | null)?.student_classes ?? []).map((student) => student.student_id),
    );
    const seedResults = await Promise.all(studentIds.map(async (studentId) => {
      const { data, error } = await supabase.rpc("seed_default_subjects", { p_student_id: studentId });
      if (error) throw error;
      return { studentId, created: Number(data ?? 0) };
    }));
    const seeded = seedResults.filter((result) => result.created > 0);
    if (seeded.length) console.info("[teacher-dashboard] auto-seeded default subjects", { teacherId: membership.id, seeded });
    const [{ data: completionRows, error: completionError }, { data: subjectRows, error: subjectError }] = studentIds.length
      ? await Promise.all([
          supabase.from("study_session_completions").select("student_id,completed").in("student_id", studentIds),
          supabase.from("subjects").select("id,student_id,subject,score").in("student_id", studentIds).order("subject"),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];
    if (completionError) throw completionError;
    if (subjectError) throw subjectError;
    const subjectsByStudent = new Map<number, typeof subjectRows>();
    for (const subject of subjectRows ?? []) {
      const existing = subjectsByStudent.get(subject.student_id) ?? [];
      existing.push(subject);
      subjectsByStudent.set(subject.student_id, existing);
    }
    const classes = (assignments ?? []).map((assignment) => {
      const classRow = assignment.class as unknown as { id: number; class_name: string; student_classes: { student_id: number; student: { id: number; name: string; user_id: string; timetable_entries: { id: number }[] } | null }[] } | null;
      if (!classRow) return assignment;
      return { ...assignment, class: { ...classRow, student_classes: classRow.student_classes.map((link) => ({ ...link, student: link.student ? { ...link.student, subjects: subjectsByStudent.get(link.student.id) ?? [] } : null })) } };
    });
    console.info("[teacher-dashboard] subject dropdown data", { teacherId: membership.id, assignedStudentIds: studentIds, subjectCount: subjectRows?.length ?? 0, subjectsByStudent: [...subjectsByStudent.entries()].map(([studentId, subjects]) => ({ studentId, subjectCount: subjects?.length ?? 0 })) });
    return Response.json({ classes, completions: completionRows ?? [] });
  } catch (error) { return apiError(error); }
}
