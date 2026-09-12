"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ApplicationRole, resolveApplicationRole, roleDashboard } from "@/lib/role-routing";

type Role = "student" | "teacher" | "admin";

const navigation: Record<Role, { href: string; label: string }[]> = {
  student: [
    { href: "/student/dashboard", label: "Dashboard" }, { href: "/student/subjects", label: "Subjects" },
    { href: "/student/study-plan", label: "Study Plan" }, { href: "/student/doubts", label: "Doubts" },
    { href: "/student/solved-doubts", label: "Solved Doubts" }, { href: "/student/analytics", label: "Analytics" },
  ],
  teacher: [
    { href: "/teacher/dashboard", label: "Dashboard" }, { href: "/teacher/classes", label: "Classes" },
    { href: "/teacher/students", label: "Students" }, { href: "/teacher/marks", label: "Marks" },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard" }, { href: "/admin/classes", label: "Classes" },
    { href: "/admin/teachers", label: "Teachers" }, { href: "/admin/invite-codes", label: "Invite Codes" }, { href: "/admin/settings", label: "Settings" },
  ],
};

export default function RoleLayout({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [authorizing, setAuthorizing] = useState(true);
  useEffect(() => {
    async function authorize() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const actualRole = await resolveApplicationRole(user.id);
      if (!actualRole) { await supabase.auth.signOut(); router.replace("/login"); return; }
      if (actualRole !== role) { router.replace(roleDashboard(actualRole)); return; }
      setAuthorizing(false);
    }
    void authorize();
  }, [role, router]);
  async function signOut() { await supabase.auth.signOut(); router.replace("/login"); }
  if (authorizing) return <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-300">Loading workspace…</div>;
  return <div className="min-h-screen bg-slate-950 text-slate-100"><header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8"><Link href={navigation[role][0].href} className="font-semibold tracking-tight">VidyaLens <span className="text-indigo-300">{role}</span></Link><button onClick={() => void signOut()} className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">Sign out</button></div><nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-8">{navigation[role].map((item) => <Link key={item.href} href={item.href} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${pathname === item.href ? "bg-indigo-500 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>{item.label}</Link>)}</nav></header>{children}</div>;
}
