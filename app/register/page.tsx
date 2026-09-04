"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [message, setMessage] = useState("");

  async function registerStudent() {
    try {
      setMessage("Registering...");

      const cleanSchoolCode = schoolCode.trim().toUpperCase();

      // Find school
      const { data: schools, error: schoolsError } =
        await supabase
          .from("schools")
          .select("*");

      if (schoolsError) {
        setMessage(`School lookup error: ${schoolsError.message}`);
        return;
      }

      const school = schools?.find(
        (s) =>
          String(s.school_code).trim().toUpperCase() ===
          cleanSchoolCode
      );

      if (!school) {
        setMessage(`School code '${cleanSchoolCode}' not found`);
        return;
      }

      // Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (authError) {
        setMessage(authError.message);
        return;
      }

      const user = authData.user;

      if (!user) {
        setMessage("Failed to create user");
        return;
      }

      // Create profile
      const { error: profileError } =
        await supabase
          .from("profiles")
          .insert({
            id: user.id,
            role: "student",
            name,
            school_id: school.id,
          });

      if (profileError) {
        setMessage(`Profile Error: ${profileError.message}`);
        return;
      }

      // Create student
      const { data: studentData, error: studentError } =
        await supabase
          .from("students")
          .insert({
            user_id: user.id,
            name,
            class: studentClass,
            school_id: school.id,
          })
          .select()
          .single();

      if (studentError) {
        setMessage(`Student Error: ${studentError.message}`);
        return;
      }

      // Create default subjects
      const { error: subjectError } =
        await supabase
          .from("subjects")
          .insert([
            {
              student_id: studentData.id,
              subject: "Maths",
              score: 0,
              exam_days: 30,
            },
            {
              student_id: studentData.id,
              subject: "Science",
              score: 0,
              exam_days: 30,
            },
            {
              student_id: studentData.id,
              subject: "English",
              score: 0,
              exam_days: 30,
            },
            {
              student_id: studentData.id,
              subject: "Social Studies",
              score: 0,
              exam_days: 30,
            },
          ]);

      if (subjectError) {
        setMessage(`Subjects Error: ${subjectError.message}`);
        return;
      }

      setMessage(
        "Account created successfully! You can now log in."
      );

      setName("");
      setStudentClass("");
      setEmail("");
      setPassword("");
      setSchoolCode("");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-xl mx-auto bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <h1 className="text-3xl font-bold mb-6">
          Student Registration
        </h1>

        <div className="space-y-4">
          <input
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            placeholder="Student Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            placeholder="Class"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
          />

          <input
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            placeholder="School Code (e.g. DEMO123)"
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value)}
          />

          <button
            onClick={registerStudent}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold w-full"
          >
            Create Account
          </button>

          {message && (
            <div className="mt-4 p-3 rounded-lg bg-slate-800">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}