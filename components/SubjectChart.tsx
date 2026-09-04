"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Props = {
  subjects: any[];
};

export default function SubjectChart({
  subjects,
}: Props) {
  const chartData = subjects.map((subject) => ({
    name: subject.subject,
    score: subject.score,
  }));

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

      <h2 className="text-xl font-semibold mb-6">
        Subject Performance
      </h2>

      <div className="h-[300px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Bar
              dataKey="score"
              fill="#3B82F6"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}