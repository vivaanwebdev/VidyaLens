"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AIStudyPlan from "@/components/AIStudyPlan";
import StudentProfile from "@/components/StudentProfile";
import RecommendationCard from "@/components/RecommendationCard";
import OverwhelmMode from "@/components/OverwhelmMode";
import SubjectChart from "@/components/SubjectChart";
import PriorityChart from "@/components/PriorityChart";
import PriorityRanking from "@/components/PriorityRanking";
import RecentAssessments, { Assessment } from "@/components/RecentAssessments";

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [overwhelmMode, setOverwhelmMode] = useState(false);

  useEffect(() => { void loadStudentDashboard(); }, []);

  async function loadStudentDashboard() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: student } = await supabase.from("students").select("*").eq("user_id", user.id).single();
      if (!student) return;
      setStudentInfo(student);
      const { data: school } = await supabase.from("schools").select("name").eq("id", student.school_id).single();
      if (school) setSchoolName(school.name);
      const [{ data: subjectsData }, { data: marksData, error: marksError }] = await Promise.all([
        supabase.from("subjects").select("*").eq("student_id", student.id),
        supabase.from("marks").select("id,assessment_name,score,max_score,assessed_at,subject:subjects(subject)").eq("student_id", student.id).order("assessed_at", { ascending: false }).order("created_at", { ascending: false }).limit(8),
      ]);
      setSubjects(subjectsData || []);
      if (marksError) console.error(marksError);
      setAssessments((marksData ?? []).map((mark) => ({ ...mark, subject: Array.isArray(mark.subject) ? mark.subject[0] ?? null : mark.subject })) as Assessment[]);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  const rankedSubjects = [...subjects].map((subject) => {
    const examDate = subject.exam_date ? new Date(subject.exam_date) : null;
    const daysRemaining = examDate ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / 86_400_000)) : 999;
    return { ...subject, daysRemaining, priority: (100 - subject.score) + Math.max(0, 30 - daysRemaining) };
  }).sort((a, b) => b.priority - a.priority);
  const academicHealth = subjects.length ? Math.round(subjects.reduce((sum, subject) => sum + subject.score, 0) / subjects.length) : 0;

  if (loading) return <main className="grid min-h-screen place-items-center bg-slate-950 text-white"><h1 className="text-3xl">Loading VidyaLens...</h1></main>;

  return <main className="min-h-screen bg-slate-950 p-8 text-white"><div className="mx-auto max-w-7xl">
    <div className="mb-10"><h1 className="text-4xl font-bold">Your learning workspace</h1><p className="mt-2 text-slate-400">AI-powered academic success, tailored to you.</p></div>
    <div className="grid gap-6 lg:grid-cols-3"><StudentProfile studentInfo={studentInfo} schoolName={schoolName} academicHealth={academicHealth} /><RecommendationCard topSubject={rankedSubjects[0]} overwhelmMode={overwhelmMode} setOverwhelmMode={setOverwhelmMode} /></div>
    <OverwhelmMode overwhelmMode={overwhelmMode} focusSubjects={rankedSubjects.slice(0, 2)} />
    <div className="mt-8 grid gap-6 lg:grid-cols-2"><SubjectChart subjects={subjects} /><PriorityChart rankedSubjects={rankedSubjects} /></div>
    <div className="mt-8"><AIStudyPlan subjects={rankedSubjects} academicHealth={academicHealth} overwhelmMode={overwhelmMode} /></div>
    <RecentAssessments assessments={assessments} />
    <div className="mt-8"><PriorityRanking rankedSubjects={rankedSubjects} /></div>
  </div></main>;
}
