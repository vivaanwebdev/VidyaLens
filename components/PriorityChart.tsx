"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

type Props = {
  rankedSubjects: any[];
};

export default function PriorityChart({
  rankedSubjects,
}: Props) {
  const priorityData = rankedSubjects.map(
    (subject) => ({
      name: subject.subject,
      value: subject.priority,
    })
  );

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
  ];

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

      <h2 className="text-xl font-semibold mb-6">
        Priority Distribution
      </h2>

      <div className="h-[300px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>

            <Pie
              data={priorityData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {priorityData.map(
                (_, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[
                        index % COLORS.length
                      ]
                    }
                  />
                )
              )}
            </Pie>

            <Tooltip />

          </PieChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}