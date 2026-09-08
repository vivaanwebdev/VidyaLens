"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TimetablePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [wakeTime, setWakeTime] = useState("06:00");
  const [schoolStart, setSchoolStart] = useState("08:00");
  const [schoolEnd, setSchoolEnd] = useState("14:00");
  const [tuitionStart, setTuitionStart] = useState("");
  const [tuitionEnd, setTuitionEnd] = useState("");
  const [sleepTime, setSleepTime] = useState("22:00");
  const [studyHours, setStudyHours] = useState(2.0);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
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

      const { data } = await supabase
        .from("timetable_settings")
        .select("*")
        .eq("student_id", student.id)
        .maybeSingle();

      if (!data) return;

      setWakeTime(data.wake_time?.slice(0, 5) || "06:00");
      setSchoolStart(data.school_start?.slice(0, 5) || "08:00");
      setSchoolEnd(data.school_end?.slice(0, 5) || "14:00");
      setTuitionStart(data.tuition_start?.slice(0, 5) || "");
      setTuitionEnd(data.tuition_end?.slice(0, 5) || "");
      setSleepTime(data.sleep_time?.slice(0, 5) || "22:00");
      setStudyHours(Number(data.study_hours) || 2.0);
    } catch (error) {
      console.error(error);
    }
  }

  async function saveSettings() {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first");
        return;
      }

      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!student) {
        setMessage("Student profile not found");
        return;
      }

      const { error } = await supabase
        .from("timetable_settings")
        .upsert({
          student_id: student.id,
          wake_time: wakeTime,
          school_start: schoolStart,
          school_end: schoolEnd,
          tuition_start: tuitionStart || null,
          tuition_end: tuitionEnd || null,
          sleep_time: sleepTime,
          study_hours: studyHours,
        });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("✅ Timetable settings saved successfully");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          📅 Timetable Settings
        </h1>

        <p className="text-slate-400 mb-6">
          Help AI create a realistic study timetable for you.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">
              Wake Up Time
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            />
          </div>

          <div>
            <label className="block mb-2">
              School Start Time
            </label>
            <input
              type="time"
              value={schoolStart}
              onChange={(e) => setSchoolStart(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            />
          </div>

          <div>
            <label className="block mb-2">
              School End Time
            </label>
            <input
              type="time"
              value={schoolEnd}
              onChange={(e) => setSchoolEnd(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            />
          </div>

          <div>
            <label className="block mb-2">
              Tuition Start Time (Optional)
            </label>
            <input
              type="time"
              value={tuitionStart}
              onChange={(e) => setTuitionStart(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            />
          </div>

          <div>
            <label className="block mb-2">
              Tuition End Time (Optional)
            </label>
            <input
              type="time"
              value={tuitionEnd}
              onChange={(e) => setTuitionEnd(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            />
          </div>

          <div>
            <label className="block mb-2">
              Sleep Time
            </label>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            />
          </div>

          <div>
            <label className="block mb-2">
              Available Study Hours Per Day
            </label>

            <input
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              value={studyHours}
              onChange={(e) =>
                setStudyHours(Number(e.target.value))
              }
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            />

            <p className="text-sm text-slate-400 mt-2">
              Example: 1.5 = 1 hour 30 minutes, 4.5 = 4 hours 30 minutes
            </p>
          </div>

          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold"
          >
            {loading
              ? "Saving..."
              : "Save Timetable Settings"}
          </button>

          {message && (
            <div className="bg-slate-800 p-3 rounded-lg">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}