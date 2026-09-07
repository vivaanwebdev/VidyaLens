"use client";

import { useState } from "react";

type Props = {
  subjects: any[];
  academicHealth: number;
  overwhelmMode: boolean;
};

export default function AIStudyPlan({
  subjects,
  academicHealth,
  overwhelmMode,
}: Props) {
  const [plan, setPlan] = useState(
    "Click 'Generate Plan' to create your personalized AI study plan."
  );

  const [loading, setLoading] = useState(false);

  async function generatePlan() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/study-plan",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            subjects,
            academicHealth,
            overwhelmMode,
          }),
        }
      );

      const data = await response.json();

      if (data.plan) {
        setPlan(data.plan);
      } else {
        setPlan(
          "Unable to generate study plan."
        );
      }
    } catch (error) {
      console.error(error);

      setPlan(
        "Unable to generate study plan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xl font-semibold">
          🧠 AI Study Planner
        </h2>

        <button
          onClick={generatePlan}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-lg text-sm"
        >
          {loading
            ? "Generating..."
            : "Generate Plan"}
        </button>

      </div>

      <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
        {plan}
      </div>

    </div>
  );
}