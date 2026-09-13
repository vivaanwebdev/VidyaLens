"use client";

import { FormEvent, useMemo, useState } from "react";
import { schoolApi } from "@/lib/school-api";

type ClassOption = { id: string | number; class_name: string; student_classes: { student: { subjects: { subject: string }[] } | null }[] };

export default function ClassExamSchedule({ classes }: { classes: ClassOption[] }) {
  const [classId, setClassId] = useState(""); const [subject, setSubject] = useState(""); const [examDate, setExamDate] = useState(""); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  const selectedClass = classes.find((item) => String(item.id) === classId);
  const subjects = useMemo(() => [...new Set((selectedClass?.student_classes ?? []).flatMap((link) => link.student?.subjects.map((item) => item.subject) ?? []))].sort(), [selectedClass]);
  async function save(event: FormEvent) { event.preventDefault(); setSaving(true); setMessage(""); try { const result = await schoolApi<{ updatedStudents: number }>("/api/teacher/exams", { method: "POST", body: JSON.stringify({ classId, subject, examDate }) }); setMessage(`Exam schedule saved for ${result.updatedStudents} student${result.updatedStudents === 1 ? "" : "s"}.`); } catch (error) { setMessage((error as Error).message); } finally { setSaving(false); } }
  return <section className="rounded-2xl border border-white/10 bg-slate-900 p-6"><h2 className="text-lg font-semibold">Class Exam Schedule</h2><p className="mt-1 text-sm text-slate-400">Apply one exam date to every student studying this subject in the selected class.</p><form onSubmit={save} className="mt-4 grid gap-3 md:grid-cols-4"><select required value={classId} onChange={(event) => { setClassId(event.target.value); setSubject(""); }} className="rounded-xl bg-slate-800 p-3"><option value="">Class</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.class_name}</option>)}</select><select required disabled={!selectedClass} value={subject} onChange={(event) => setSubject(event.target.value)} className="rounded-xl bg-slate-800 p-3 disabled:opacity-50"><option value="">Subject</option>{subjects.map((item) => <option key={item} value={item}>{item}</option>)}</select><input required type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} className="rounded-xl bg-slate-800 p-3"/><button disabled={saving} className="rounded-xl bg-violet-400 px-4 font-semibold text-slate-950 disabled:opacity-50">{saving ? "Saving…" : "Save schedule"}</button></form>{message && <p className="mt-3 text-sm text-violet-200">{message}</p>}</section>;
}
