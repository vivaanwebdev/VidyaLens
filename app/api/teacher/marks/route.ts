import { NextRequest } from "next/server";
import { apiError, requireRole } from "@/lib/school-server";

export async function POST(request: NextRequest) {
  try {
    const { supabase, membership } = await requireRole(request, "teacher");
    const { studentId, subjectId, assessmentName, score, maxScore, assessedAt } = await request.json();
    if (!studentId || !subjectId || !assessmentName?.trim() || !Number.isFinite(Number(score)) || !Number.isFinite(Number(maxScore))) throw new Error("Student, subject, assessment, score, and maximum score are required");
    if (Number(score) < 0 || Number(maxScore) <= 0 || Number(score) > Number(maxScore)) throw new Error("Score must be between zero and the maximum score");
    const { data: subject, error: subjectError } = await supabase
      .from("subjects")
      .select("id")
      .eq("id", Number(subjectId))
      .eq("student_id", Number(studentId))
      .maybeSingle();
    if (subjectError) throw subjectError;
    if (!subject) throw new Error("Choose a valid subject for the selected student");
    const { error } = await supabase.from("marks").insert({
      student_id: Number(studentId), teacher_id: membership.id, subject_id: Number(subjectId),
      assessment_name: assessmentName.trim(), score: Number(score), max_score: Number(maxScore), assessed_at: assessedAt || new Date().toISOString().slice(0, 10),
    });
    if (error) throw error;
    const { data: subjectMarks, error: marksError } = await supabase
      .from("marks")
      .select("score,max_score")
      .eq("student_id", Number(studentId))
      .eq("subject_id", Number(subjectId));
    if (marksError) throw marksError;
    const averagePercentage = Math.round((subjectMarks ?? []).reduce(
      (total, mark) => total + (Number(mark.score) / Number(mark.max_score)) * 100,
      0,
    ) / Math.max((subjectMarks ?? []).length, 1));
    const { error: scoreError } = await supabase
      .from("subjects")
      .update({ score: averagePercentage })
      .eq("id", Number(subjectId))
      .eq("student_id", Number(studentId));
    if (scoreError) throw scoreError;
    return Response.json({ ok: true, subjectScore: averagePercentage }, { status: 201 });
  } catch (error) { return apiError(error); }
}
