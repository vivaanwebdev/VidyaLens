import { StreakStats, streakMessage } from "@/lib/streaks";

export default function StudyStreakCard({ stats }: { stats: StreakStats }) {
  return <section className="mt-6 rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-500/15 via-slate-900 to-slate-900 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium uppercase tracking-[.16em] text-orange-200">Study streak</p><p className="mt-1 text-sm text-slate-300">{streakMessage(stats.currentStreak)}</p></div><span className="rounded-full bg-orange-400/15 px-3 py-1 text-sm font-semibold text-orange-200">Keep the momentum</span></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label="🔥 Current Streak" value={`${stats.currentStreak} ${stats.currentStreak === 1 ? "day" : "days"}`} /><Metric label="🏆 Longest Streak" value={`${stats.longestStreak} ${stats.longestStreak === 1 ? "day" : "days"}`} /><Metric label="📅 Weekly Consistency" value={`${stats.weeklyConsistency}%`} /></div></section>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-950/50 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-xl font-semibold text-white">{value}</p></div>; }
