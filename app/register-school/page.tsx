"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { schoolApi } from "@/lib/school-api";

const pendingRegistrationKey = "vidyalens.pending-school-registration";
type PendingRegistration = { schoolName: string; schoolCode: string };

export default function RegisterSchoolPage() {
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const completeSchoolRegistration = useCallback(async (registration: PendingRegistration) => {
    await schoolApi<{ school: { school_id: number } }>("/api/onboarding/register-school", {
      method: "POST",
      body: JSON.stringify(registration),
    });
    window.sessionStorage.removeItem(pendingRegistrationKey);
    router.replace("/admin/dashboard");
  }, [router]);

  useEffect(() => {
    async function resumeConfirmedRegistration() {
      const pending = window.sessionStorage.getItem(pendingRegistrationKey);
      if (!pending) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      try {
        setBusy(true);
        await completeSchoolRegistration(JSON.parse(pending) as PendingRegistration);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to finish school registration.");
        setBusy(false);
      }
    }
    void resumeConfirmedRegistration();
  }, [completeSchoolRegistration]);

  async function registerSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const normalizedCode = schoolCode.trim().toUpperCase();
      const registration = { schoolName: schoolName.trim(), schoolCode: normalizedCode };
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: `${window.location.origin}/register-school` },
      });
      if (error) throw error;
      if (!data.user) throw new Error("We could not create your account.");

      if (!data.session) {
        window.sessionStorage.setItem(pendingRegistrationKey, JSON.stringify(registration));
        setMessage("Check your email to confirm your account. We will finish creating your school when you return here.");
        return;
      }
      await completeSchoolRegistration(registration);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to register your school.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-slate-950 p-5 text-slate-100"><form onSubmit={registerSchool} className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl sm:p-9"><Link href="/" className="text-sm font-semibold text-indigo-300 hover:text-indigo-200">← VidyaLens</Link><p className="mt-6 text-sm font-semibold uppercase tracking-[.18em] text-indigo-300">School workspace</p><h1 className="mt-2 text-3xl font-bold">Register your school</h1><p className="mt-3 leading-6 text-slate-400">Create your administrator account first. You can invite teachers and students from the admin dashboard.</p><div className="mt-7 grid gap-4"><label className="grid gap-2 text-sm font-medium">School name<input required minLength={2} value={schoolName} onChange={(event) => setSchoolName(event.target.value)} placeholder="Northstar Academy" className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 font-normal outline-none focus:border-indigo-400" /></label><label className="grid gap-2 text-sm font-medium">School code<input required minLength={4} maxLength={20} value={schoolCode} onChange={(event) => setSchoolCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="NORTH2026" className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 font-mono font-normal tracking-wider outline-none focus:border-indigo-400" /><span className="text-xs font-normal text-slate-500">Use 4–20 letters or numbers. Share this identifier only when needed.</span></label><label className="grid gap-2 text-sm font-medium">Administrator email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@northstar.edu" className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 font-normal outline-none focus:border-indigo-400" /></label><label className="grid gap-2 text-sm font-medium">Password<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 font-normal outline-none focus:border-indigo-400" /></label></div><button disabled={busy} className="mt-7 w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Creating your workspace…" : "Create school workspace"}</button>{message && <p className="mt-4 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-300">{message}</p>}<p className="mt-6 text-center text-sm text-slate-400">Already have an account? <Link href="/login" className="text-indigo-300 hover:text-indigo-200">Log in</Link></p></form></main>;
}
