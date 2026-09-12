"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StudyStreakCard from "@/components/StudyStreakCard";
import { StreakStats } from "@/lib/streaks";

type Props = {
  subjects: any[];
  academicHealth: number;
  overwhelmMode: boolean;
};

type Session = {
  id?: number;
  startTime: string;
  endTime: string;
  subject: string;
  reason: string;
  completed?: boolean;
};

const subjectIcons: Record<string, string> = {
  Maths: "📐",
  Science: "🧪",
  English: "📖",
  "Social Studies": "🌍",
  Hindi: "📚",
};

const subjectBorders: Record<string, string> = {
  Maths: "border-blue-500",
  Science: "border-purple-500",
  English: "border-pink-500",
  "Social Studies": "border-green-500",
  Hindi: "border-orange-500",
};

export default function AIStudyPlan({
  subjects,
  academicHealth,
  overwhelmMode,
}: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [motivation, setMotivation] = useState("");
  const [streakStats, setStreakStats] = useState<StreakStats>({ currentStreak: 0, longestStreak: 0, weeklyConsistency: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    "Generate your timetable to get started."
  );

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editSubject, setEditSubject] =
    useState("");

  const [editStartTime, setEditStartTime] =
    useState("");

  const [editEndTime, setEditEndTime] =
    useState("");

  const [editReason, setEditReason] =
    useState("");

 useEffect(() => {
  loadTodaysTimetable();
  loadStreakStats();
}, []);

  async function loadTodaysTimetable() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!student) return;

      const today = new Date()
        .toISOString()
        .split("T")[0];

      const { data } = await supabase
        .from("timetable_entries")
        .select("*")
        .eq("student_id", student.id)
        .eq("study_date", today)
        .order("start_time");

      if (!data) return;

      const loadedSessions =
        data.map((item: any) => ({
          id: item.id,
          startTime:
            item.start_time?.slice(0, 5),
          endTime:
            item.end_time?.slice(0, 5),
          subject: item.subject,
          reason: item.reason,
completed: item.completed,
        }));

      setSessions(loadedSessions);

      if (loadedSessions.length > 0) {
        setMessage("");
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function loadStreakStats() {
    try {
      const { data, error } = await supabase.rpc("study_streak_stats");
      if (error) throw error;
      const stats = data?.[0];
      setStreakStats({ currentStreak: Number(stats?.current_streak ?? 0), longestStreak: Number(stats?.longest_streak ?? 0), weeklyConsistency: Number(stats?.weekly_consistency ?? 0) });
    } catch (error) { console.error(error); }
  }

  function startEdit(session: Session) {
    setEditingId(session.id || null);

    setEditSubject(session.subject);
    setEditStartTime(session.startTime);
    setEditEndTime(session.endTime);
    setEditReason(session.reason);
  }

  async function saveEdit() {
    if (!editingId) return;

    const { error } = await supabase
      .from("timetable_entries")
      .update({
        subject: editSubject,
        start_time: editStartTime,
        end_time: editEndTime,
        reason: editReason,
      })
      .eq("id", editingId);

    if (error) {
      alert(error.message);
      return;
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === editingId
          ? {
              ...s,
              subject: editSubject,
              startTime: editStartTime,
              endTime: editEndTime,
              reason: editReason,
            }
          : s
      )
    );

    setEditingId(null);
  }

  async function deleteSession(
    id?: number
  ) {
    if (!id) return;

    const ok = confirm(
      "Delete this session?"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("timetable_entries")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setSessions((prev) =>
      prev.filter((s) => s.id !== id)
    );
  }
 async function toggleCompleted(
  id?: number,
  current?: boolean
) {
  if (!id) return;

  try {
    const { error } = await supabase.rpc("set_study_session_completion", { p_timetable_entry_id: id, p_completed: !current });
    if (error) throw error;
    setSessions((prev) => prev.map((session) => session.id === id ? { ...session, completed: !current } : session));
    await loadStreakStats();
  } catch (err) { console.error(err); alert("Session completion was not saved. Please try again."); }
}

  async function generatePlan() {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!student) {
        setMessage(
          "Student profile not found."
        );
        return;
      }

      const { data: timetable } =
        await supabase
          .from("timetable_settings")
          .select("*")
          .eq("student_id", student.id)
          .maybeSingle();

      if (!timetable) {
        setMessage(
          "Please complete your timetable settings first."
        );
        return;
      }

      const response = await fetch(
        "/api/study-plan",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            subjects,
            academicHealth,
            overwhelmMode,

            wakeTime:
              timetable.wake_time,

            schoolStart:
              timetable.school_start,

            schoolEnd:
              timetable.school_end,

            tuitionStart:
              timetable.tuition_start,

            tuitionEnd:
              timetable.tuition_end,

            sleepTime:
              timetable.sleep_time,

            studyHours:
              timetable.study_hours,
          }),
        }
      );

      const data = await response.json();

      const generatedSessions =
        Array.isArray(data.sessions)
          ? data.sessions
          : [];

      setMotivation(
        data.motivation || ""
      );

      if (
        generatedSessions.length === 0
      ) {
        setMessage(
          "No timetable could be generated."
        );
        return;
      }

      const today = new Date()
        .toISOString()
        .split("T")[0];

      await supabase
        .from("timetable_entries")
        .delete()
        .eq("student_id", student.id)
        .eq("study_date", today)
        .eq("generated_by_ai", true);

      const rows =
        generatedSessions.map(
          (session: Session) => ({
            student_id: student.id,
            study_date: today,
            start_time:
              session.startTime,
            end_time:
              session.endTime,
            subject:
              session.subject,
            reason:
              session.reason,
            generated_by_ai: true,
completed: false,
          })
        );

      await supabase
        .from("timetable_entries")
        .insert(rows);

      await loadTodaysTimetable();
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to generate timetable."
      );
    } finally {
      setLoading(false);
    }
  }
const completedCount = sessions.filter(
  (s) => s.completed
).length;

const completionRate =
  sessions.length > 0
    ? Math.round(
        (completedCount / sessions.length) *
          100
      )
    : 0;
  const todayLabel =
    new Date().toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
      }
    );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">
            📅 Smart Timetable
          </h2>

          <p className="text-slate-400">
            {todayLabel}
          </p>
        </div>

        <button
          onClick={generatePlan}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl"
        >
          {loading
            ? "Generating..."
            : "Generate Today's Timetable"}
        </button>
      </div>

      {message &&
        sessions.length === 0 && (
          <div className="text-slate-400 mb-4">
            {message}
          </div>
        )}
      <StudyStreakCard stats={streakStats} />
      <div className="space-y-5">
        {sessions.length > 0 && (
  <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">

    <div className="flex justify-between mb-3">
      <p className="font-semibold">
        📈 Today's Progress
      </p>

      <p className="text-green-400 font-semibold">
        {completionRate}%
      </p>
    </div>

    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">

      <div
        className="bg-green-500 h-3 transition-all duration-500"
        style={{
          width: `${completionRate}%`,
        }}
      />

    </div>

    <p className="text-slate-300 mt-3">
      {completedCount} of{" "}
      {sessions.length} sessions completed
    </p>

  </div>
)}

        {sessions.map(
          (session, index) => (
            <div
              key={session.id || index}
              className={`rounded-2xl p-5 border-l-4 ${
  session.completed
    ? "bg-green-900/30"
    : "bg-slate-800"
} ${
                subjectBorders[
                  session.subject
                ] ||
                "border-blue-500"
              }`}
            >
              <div className="flex justify-between">

                <div>
                  <h3 className="text-xl font-semibold">
                    {subjectIcons[
                      session.subject
                    ] || "📚"}{" "}
                    {session.subject}
                  </h3>

                  <p className="text-blue-400 mt-1">
                    🕒{" "}
                    {
                      session.startTime
                    }{" "}
                    -{" "}
                    {
                      session.endTime
                    }
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
  <button
    onClick={() =>
      toggleCompleted(
        session.id,
        session.completed
      )
    }
    className={`px-3 py-1 rounded-lg text-sm ${
      session.completed
        ? "bg-green-600"
        : "bg-slate-600"
    }`}
  >
    {session.completed
      ? "✓ Completed"
      : "Mark Done"}
  </button>

  <button
    onClick={() => startEdit(session)}
    className="bg-yellow-600 px-3 py-1 rounded-lg text-sm"
  >
    Edit
  </button>

  <button
    onClick={() => deleteSession(session.id)}
    className="bg-red-600 px-3 py-1 rounded-lg text-sm"
  >
    Delete
  </button>
</div>

              </div>

              <p className="text-slate-300 mt-4">
                {session.reason}
              </p>

              {editingId ===
                session.id && (
                <div className="mt-4 space-y-3">

                  <input
                    value={
                      editSubject
                    }
                    onChange={(
                      e
                    ) =>
                      setEditSubject(
                        e.target
                          .value
                      )
                    }
                    className="w-full bg-slate-700 p-2 rounded"
                  />

                  <input
                    type="time"
                    value={
                      editStartTime
                    }
                    onChange={(
                      e
                    ) =>
                      setEditStartTime(
                        e.target
                          .value
                      )
                    }
                    className="w-full bg-slate-700 p-2 rounded"
                  />

                  <input
                    type="time"
                    value={
                      editEndTime
                    }
                    onChange={(
                      e
                    ) =>
                      setEditEndTime(
                        e.target
                          .value
                      )
                    }
                    className="w-full bg-slate-700 p-2 rounded"
                  />

                  <textarea
                    value={
                      editReason
                    }
                    onChange={(
                      e
                    ) =>
                      setEditReason(
                        e.target
                          .value
                      )
                    }
                    className="w-full bg-slate-700 p-2 rounded"
                  />

                  <button
                    onClick={
                      saveEdit
                    }
                    className="bg-green-600 px-4 py-2 rounded"
                  >
                    Save Changes
                  </button>

                </div>
              )}

            </div>
          )
        )}

      </div>

      {motivation && (
        <div className="mt-8 rounded-2xl border border-green-700 bg-gradient-to-r from-green-900/40 to-green-700/20 p-5">
          <h3 className="text-lg font-semibold mb-2">
            🏆 Motivation For You
          </h3>

          <p>{motivation}</p>
        </div>
      )}

    </div>
  );
}
