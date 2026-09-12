import { NextRequest } from "next/server";
import { apiError, requireRole } from "@/lib/school-server";

export async function POST(request: NextRequest) {
  try {
    const { supabase, membership } = await requireRole(request, "teacher");
    const { studentId, subjectId, assessmentName, score, maxScore, assessedAt } = await request.json();
    if (!studentId || !assessmentName?.trim() || !Number.isFinite(Number(score)) || !Number.isFinite(Number(maxScore))) throw new Error("Complete all mark fields");
    const { error } = await supabase.from("marks").insert({
      student_id: Number(studentId), teacher_id: membership.id, subject_id: subjectId ? Number(subjectId) : null,
      assessment_name: assessmentName.trim(), score: Number(score), max_score: Number(maxScore), assessed_at: assessedAt || new Date().toISOString().slice(0, 10),
    });
    if (error) throw error;
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) { return apiError(error); }
}
