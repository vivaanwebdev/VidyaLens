type Props = {
  overwhelmMode: boolean;
  focusSubjects: any[];
};

export default function OverwhelmMode({
  overwhelmMode,
  focusSubjects,
}: Props) {
  if (!overwhelmMode) return null;

  return (
    <div className="mt-8 bg-yellow-500 text-black rounded-2xl p-6">

      <h2 className="text-2xl font-bold mb-4">
        🧘 Overwhelm Mode
      </h2>

      <p className="mb-4">
        Ignore everything else today.
        Focus only on these subjects.
      </p>

      <div className="space-y-3">

        {focusSubjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white rounded-xl p-4 font-semibold"
          >
            • {subject.subject}
          </div>
        ))}

      </div>

    </div>
  );
}