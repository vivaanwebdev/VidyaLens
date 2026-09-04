"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MyDoubtsPage() {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyDoubts();
  }, []);

  async function loadMyDoubts() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("doubts")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        return;
      }

      setDoubts(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          My Doubts
        </h1>

        {doubts.length === 0 ? (
          <div className="bg-slate-900 p-6 rounded-xl">
            No doubts submitted yet.
          </div>
        ) : (
          <div className="space-y-6">

            {doubts.map((doubt) => (
              <div
                key={doubt.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >

                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Doubt #{doubt.id}
                  </h2>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      doubt.status === "answered"
                        ? "bg-green-600"
                        : "bg-yellow-600"
                    }`}
                  >
                    {doubt.status}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">
                    Question
                  </h3>

                  <p>{doubt.question}</p>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">
                    AI Answer
                  </h3>

                  <p className="whitespace-pre-wrap text-slate-300">
                    {doubt.ai_answer}
                  </p>
                </div>

                {doubt.teacher_answer && (
                  <div className="bg-green-900/30 border border-green-700 rounded-xl p-4">

                    <h3 className="font-semibold mb-2 text-green-400">
                      Teacher Reply
                    </h3>

                    <p className="whitespace-pre-wrap">
                      {doubt.teacher_answer}
                    </p>

                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}