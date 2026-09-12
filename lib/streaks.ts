export type StreakSession = { id: number; studyDate: string; completed: boolean };

export type StreakStats = { currentStreak: number; longestStreak: number; weeklyConsistency: number };

export function localDate(date = new Date()): string {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return localDate(value);
}

function completedByDay(sessions: StreakSession) { return sessions.completed; }

export function calculateCurrentStreak(sessions: StreakSession[], today = localDate()): number {
  const byDay = groupByDay(sessions); let streak = 0; let date = today;
  while (byDay.has(date) && byDay.get(date)!.every(completedByDay)) { streak += 1; date = addDays(date, -1); }
  return streak;
}

export function calculateLongestStreak(sessions: StreakSession[], today = localDate()): number {
  const byDay = groupByDay(sessions); const dates = [...byDay.keys()].filter((date) => date <= today).sort();
  if (!dates.length) return 0;
  let longest = 0; let running = 0; let cursor = dates[0]; const last = dates[dates.length - 1];
  while (cursor <= last) { if (byDay.get(cursor)?.every(completedByDay)) { running += 1; longest = Math.max(longest, running); } else { running = 0; } cursor = addDays(cursor, 1); }
  return longest;
}

export function calculateWeeklyCompletion(sessions: StreakSession[], today = localDate()): number {
  const byDay = groupByDay(sessions); let scheduledDays = 0; let completedDays = 0;
  for (let index = 0; index < 7; index += 1) { const day = byDay.get(addDays(today, -index)); if (day?.length) { scheduledDays += 1; if (day.every(completedByDay)) completedDays += 1; } }
  return scheduledDays ? Math.round((completedDays / scheduledDays) * 100) : 0;
}

export function calculateStreakStats(sessions: StreakSession[], today = localDate()): StreakStats {
  return { currentStreak: calculateCurrentStreak(sessions, today), longestStreak: calculateLongestStreak(sessions, today), weeklyConsistency: calculateWeeklyCompletion(sessions, today) };
}

export function streakMessage(streak: number): string {
  if (streak >= 30) return "30-day streak achieved. Outstanding discipline.";
  if (streak >= 7) return "One week streak! Excellent consistency.";
  if (streak >= 1) return "Great start. Keep going.";
  return "Complete every scheduled session today to begin a streak.";
}

function groupByDay(sessions: StreakSession[]): Map<string, StreakSession[]> {
  return sessions.reduce((days, session) => { const entries = days.get(session.studyDate) ?? []; entries.push(session); days.set(session.studyDate, entries); return days; }, new Map<string, StreakSession[]>());
}
