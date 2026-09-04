"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import AIStudyPlan from "../components/AIStudyPlan";
import StudentProfile from "../components/StudentProfile";
import RecommendationCard from "../components/RecommendationCard";
import OverwhelmMode from "../components/OverwhelmMode";
import SubjectChart from "../components/SubjectChart";
import PriorityChart from "../components/PriorityChart";
import PriorityRanking from "../components/PriorityRanking";

export default function Home() {
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [overwhelmMode, setOverwhelmMode] =
    useState(false);

  useEffect(() => {
    loadStudentDashboard();
  }, []);

  async function loadStudentDashboard() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!student) {
        setLoading(false);
        return;
      }

      setStudentInfo(student);

      const { data: school } = await supabase
        .from("schools")
        .select("*")
        .eq("id", student.school_id)
        .single();

      if (school) {
        setSchoolName(school.name);
      }

      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .eq("student_id", student.id);

      setSubjects(subjectsData || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const rankedSubjects = [...subjects]
    .map((subject) => {
      const examDate = subject.exam_date
        ? new Date(subject.exam_date)
        : null;

      const daysRemaining = examDate
        ? Math.max(
            0,
            Math.ceil(
              (examDate.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : 999;

      return {
        ...subject,
        daysRemaining,
        priority:
          (100 - subject.score) +
          Math.max(0, 30 - daysRemaining),
      };
    })
    .sort((a, b) => b.priority - a.priority);

  const topSubject = rankedSubjects[0];

  const focusSubjects =
    rankedSubjects.slice(0, 2);

  const academicHealth =
    subjects.length > 0
      ? Math.round(
          subjects.reduce(
            (sum, subject) =>
              sum + subject.score,
            0
          ) / subjects.length
        )
      : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <h1 className="text-3xl">
          Loading VidyaLens...
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold">
              VidyaLens
            </h1>

            <p className="text-slate-400 mt-2">
              AI-Powered Academic Success Platform
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
          >
            Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          <StudentProfile
            studentInfo={studentInfo}
            schoolName={schoolName}
            academicHealth={academicHealth}
          />

          <RecommendationCard
            topSubject={topSubject}
            overwhelmMode={overwhelmMode}
            setOverwhelmMode={
              setOverwhelmMode
            }
          />

        </div>

        <OverwhelmMode
          overwhelmMode={overwhelmMode}
          focusSubjects={focusSubjects}
        />

        <div className="grid lg:grid-cols-2 gap-6 mt-8">

          <SubjectChart
            subjects={subjects}
          />

          <PriorityChart
            rankedSubjects={
              rankedSubjects
            }
          />

        </div>

        {/* AI STUDY PLANNER */}

        <div className="mt-8">
          <AIStudyPlan
            subjects={rankedSubjects}
            academicHealth={academicHealth}
            overwhelmMode={overwhelmMode}
          />
        </div>

        <div className="mt-8">
          <PriorityRanking
            rankedSubjects={
              rankedSubjects
            }
          />
        </div>

      </div>
    </main>
  );
}