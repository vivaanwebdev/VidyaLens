"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TeacherPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadStudents();
    loadDoubts();
  }, []);

  async function loadStudents() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("id");

    if (error) {
      console.error(error);
      return;
    }

    setStudents(data || []);

    if (data && data.length > 0) {
      setSelectedStudent(String(data[0].id));
      loadSubjects(data[0].id);
    }
  }

  async function loadSubjects(studentId: number) {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("student_id", studentId);

    if (error) {
      console.error(error);
      return;
    }

    setSubjects(data || []);
  }

  async function loadDoubts() {
    const { data, error } = await supabase
      .from("doubts")
      .select("*")
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setDoubts(data || []);
  }

  async function updateSubject(
    subjectId: number,
    score: number,
    examDate: string
  ) {
    const { error } = await supabase
      .from("subjects")
      .update({
        score,
        exam_date: examDate,
      })
      .eq("id", subjectId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("✅ Subject updated successfully");

    loadSubjects(Number(selectedStudent));
  }

  async function answerDoubt(
    doubtId: number,
    teacherAnswer: string
  ) {
    if (!teacherAnswer.trim()) return;

    const { error } = await supabase
      .from("doubts")
      .update({
        teacher_answer: teacherAnswer,
        status: "answered",
      })
      .eq("id", doubtId);

    if (error) {
      console.error(error);
      return;
    }

    loadDoubts();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Teacher Dashboard
        </h1>

        <div className="bg-slate-900 p-6 rounded-2xl mb-8">
          <label className="block mb-2 font-semibold">
            Select Student
          </label>

          <select
            value={selectedStudent}
            onChange={(e) => {
              setSelectedStudent(e.target.value);
              loadSubjects(Number(e.target.value));
            }}
            className="w-full p-3 rounded bg-slate-800"
          >
            {students.map((student) => (
              <option
                key={student.id}
                value={student.id}
              >
                {student.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">

          <h2 className="text-2xl font-semibold mb-6">
            Subject Management
          </h2>

          <div className="space-y-4">

            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onSave={updateSubject}
              />
            ))}

          </div>

          {message && (
            <div className="mt-6 bg-slate-800 p-3 rounded">
              {message}
            </div>
          )}

        </div>

        <div className="bg-slate-900 p-6 rounded-2xl mt-8">

          <h2 className="text-2xl font-semibold mb-6">
            Pending Doubts
          </h2>

          {doubts.length === 0 ? (
            <p>No pending doubts 🎉</p>
          ) : (
            <div className="space-y-6">

              {doubts.map((doubt) => (
                <DoubtCard
                  key={doubt.id}
                  doubt={doubt}
                  onAnswer={answerDoubt}
                />
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}

function SubjectCard({
  subject,
  onSave,
}: {
  subject: any;
  onSave: (
    subjectId: number,
    score: number,
    examDate: string
  ) => void;
}) {
  const [score, setScore] = useState(subject.score);
  const [examDate, setExamDate] = useState(
    subject.exam_date || ""
  );

  return (
    <div className="bg-slate-800 p-4 rounded-xl">

      <div className="mb-4">
        <h3 className="font-semibold text-lg">
          {subject.subject}
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <div>
          <label className="block mb-2 text-sm text-slate-400">
            Score
          </label>

          <input
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) =>
              setScore(Number(e.target.value))
            }
            className="w-full bg-slate-700 p-3 rounded"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-slate-400">
            Exam Date
          </label>

          <input
            type="date"
            value={examDate}
            onChange={(e) =>
              setExamDate(e.target.value)
            }
            className="w-full bg-slate-700 p-3 rounded"
          />
        </div>

      </div>

      <button
        onClick={() =>
          onSave(subject.id, score, examDate)
        }
        className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
      >
        Save Changes
      </button>

    </div>
  );
}

function DoubtCard({
  doubt,
  onAnswer,
}: {
  doubt: any;
  onAnswer: (
    doubtId: number,
    answer: string
  ) => void;
}) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="bg-slate-800 p-4 rounded-xl">

      <h3 className="font-semibold mb-2">
        Student Question
      </h3>

      <p className="mb-4">
        {doubt.question}
      </p>

      <h3 className="font-semibold mb-2">
        AI Answer
      </h3>

      <p className="mb-4 whitespace-pre-wrap text-slate-300">
        {doubt.ai_answer}
      </p>

      <textarea
        value={answer}
        onChange={(e) =>
          setAnswer(e.target.value)
        }
        placeholder="Enter teacher response..."
        className="w-full h-32 bg-slate-700 p-3 rounded"
      />

      <button
        onClick={() =>
          onAnswer(doubt.id, answer)
        }
        className="mt-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
      >
        Submit Answer
      </button>

    </div>
  );
}