"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import { supabase } from "../../../lib/supabase";

export default function UploadReportPage() {
  const [image, setImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");

  async function handleOCR() {
    if (!image) return;

    setLoading(true);

    try {
      const result = await Tesseract.recognize(
        image,
        "eng"
      );

      const text = result.data.text;

      setExtractedText(text);

      console.log(text);
    } catch (error) {
      console.error(error);
      alert("OCR failed");
    }

    setLoading(false);
  }

  async function importMarks() {
    if (!studentId) {
      alert("Enter Student ID first");
      return;
    }

    const text = extractedText.toLowerCase();

    const updates = [];

    const subjects = [
      "maths",
      "science",
      "english",
      "social studies",
    ];

    for (const subject of subjects) {
      const regex = new RegExp(
        `${subject}\\D+(\\d{1,3})`,
        "i"
      );

      const match = text.match(regex);

      if (match) {
        updates.push({
          subject,
          score: Number(match[1]),
        });
      }
    }

    for (const item of updates) {
      await supabase
        .from("subjects")
        .update({
          score: item.score,
        })
        .eq("student_id", Number(studentId))
        .ilike("subject", item.subject);
    }

    alert(
      `Imported ${updates.length} subject marks successfully`
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          AI Report Card Upload
        </h1>

        <div className="bg-slate-900 p-6 rounded-2xl space-y-4">

          <input
            type="number"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) =>
              setStudentId(e.target.value)
            }
            className="w-full p-3 rounded bg-slate-800"
          />

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) =>
              setImage(
                e.target.files?.[0] || null
              )
            }
          />

          <button
            onClick={handleOCR}
            disabled={loading}
            className="bg-blue-600 px-5 py-3 rounded-xl"
          >
            {loading
              ? "Reading Report Card..."
              : "Extract Marks"}
          </button>

          {extractedText && (
            <button
              onClick={importMarks}
              className="ml-4 bg-green-600 px-5 py-3 rounded-xl"
            >
              Import Marks
            </button>
          )}

        </div>

        {extractedText && (
          <div className="mt-8 bg-slate-900 p-6 rounded-2xl">

            <h2 className="text-2xl font-semibold mb-4">
              OCR Output
            </h2>

            <pre className="whitespace-pre-wrap text-sm">
              {extractedText}
            </pre>

          </div>
        )}

      </div>
    </main>
  );
}