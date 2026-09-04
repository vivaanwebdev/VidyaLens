"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DoubtsPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function askAI() {
    try {
      setLoading(true);
      setAnswer("");
      setMessage("");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const data = await response.json();

      setAnswer(data.answer);
    } catch (error) {
      console.error(error);
      setMessage("Failed to get AI response.");
    } finally {
      setLoading(false);
    }
  }

  async function sendToTeacher() {
    try {
      setSaving(true);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login again.");
        return;
      }

      const { error } = await supabase
        .from("doubts")
        .insert({
          student_id: user.id,
          question,
          ai_answer: answer,
          status: "pending",
        });

      if (error) {
        console.error(error);
        setMessage(error.message);
        return;
      }

      setMessage(
        "Your doubt has been sent to the teacher successfully."
      );
    } catch (error) {
      console.error(error);
      setMessage("Failed to send doubt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">
          AI Doubt Solver
        </h1>

        <p className="text-slate-400 mb-8">
          Ask AI first. If you're still confused,
          send your doubt to a teacher anonymously.
        </p>

        <textarea
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          placeholder="Ask your academic doubt..."
          className="w-full h-40 p-4 rounded-xl bg-slate-900 border border-slate-700"
        />

        <button
          onClick={askAI}
          disabled={loading || !question}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>

        {answer && (
          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">

            <h2 className="text-xl font-semibold mb-4">
              AI Answer
            </h2>

            <p className="whitespace-pre-wrap text-slate-200">
              {answer}
            </p>

            <div className="mt-6 border-t border-slate-700 pt-6">

              <p className="mb-4 text-yellow-400">
                Still confused?
              </p>

              <button
                onClick={sendToTeacher}
                disabled={saving}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-semibold"
              >
                {saving
                  ? "Sending..."
                  : "Send to Teacher"}
              </button>

            </div>

          </div>
        )}

        {message && (
          <div className="mt-6 bg-slate-900 border border-slate-700 rounded-xl p-4">
            {message}
          </div>
        )}

      </div>
    </main>
  );
}