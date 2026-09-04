type Props = {
  topSubject: any;
  overwhelmMode: boolean;
  setOverwhelmMode: (value: boolean) => void;
};

export default function RecommendationCard({
  topSubject,
  overwhelmMode,
  setOverwhelmMode,
}: Props) {
  if (!topSubject) return null;

  return (
    <div className="lg:col-span-2 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-8">

      <h2 className="text-2xl font-bold mb-4">
        Today's Recommendation
      </h2>

      <p className="text-xl">
        Focus on <strong>{topSubject.subject}</strong>
      </p>

      <p className="mt-3">
        Current Score: {topSubject.score}%
      </p>

      <p>
        Exam In: {topSubject.daysRemaining} days
      </p>

      <div className="mt-5 inline-block bg-white text-black px-5 py-2 rounded-xl font-semibold">
        Priority Score: {topSubject.priority}
      </div>

      <div className="mt-5">
        <button
          onClick={() =>
            setOverwhelmMode(!overwhelmMode)
          }
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2 rounded-xl font-semibold"
        >
          {overwhelmMode
            ? "Disable Overwhelm Mode"
            : "Enable Overwhelm Mode"}
        </button>
      </div>

    </div>
  );
}