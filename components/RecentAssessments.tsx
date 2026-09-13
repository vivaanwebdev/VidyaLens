export type Assessment = {
  id: number;
  assessment_name: string;
  score: number;
  max_score: number;
  assessed_at: string;
  subject: { subject: string } | null;
};

export default function RecentAssessments({ assessments }: { assessments: Assessment[] }) {
  return <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-900"><div className="border-b border-white/10 p-6"><h2 className="text-xl font-semibold">Recent Assessments</h2><p className="mt-1 text-sm text-slate-400">Your latest teacher-recorded performance.</p></div>{assessments.length === 0 ? <p className="p-6 text-sm text-slate-400">No assessments recorded yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-800/70 text-slate-400"><tr><th className="px-6 py-3">Subject</th><th>Assessment</th><th>Score</th><th>Max score</th><th>Percentage</th><th>Date</th></tr></thead><tbody>{assessments.map((assessment) => <tr key={assessment.id} className="border-t border-white/5"><td className="px-6 py-4 font-medium">{assessment.subject?.subject ?? "Subject"}</td><td>{assessment.assessment_name}</td><td>{assessment.score}</td><td>{assessment.max_score}</td><td>{Math.round((Number(assessment.score) / Number(assessment.max_score)) * 100)}%</td><td>{new Date(`${assessment.assessed_at}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td></tr>)}</tbody></table></div>}</section>;
}
