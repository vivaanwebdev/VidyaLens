type Props = {
  rankedSubjects: any[];
};

export default function PriorityRanking({
  rankedSubjects,
}: Props) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

      <h2 className="text-xl font-semibold mb-6">
        Live Priority Ranking
      </h2>

      <div className="space-y-3">

        {rankedSubjects.map(
          (subject, index) => (
            <div
              key={subject.id}
              className="flex justify-between bg-slate-800 p-4 rounded-xl"
            >
              <span>
                #{index + 1} {subject.subject}
              </span>

              <span>
                Priority: {subject.priority}
              </span>
            </div>
          )
        )}

      </div>

    </div>
  );
}