"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TestPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("subjects")
        .select("*");

      console.log(data);
      console.log(error);

      if (data) setRows(data);
    }

    load();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Subjects Table
      </h1>

      <pre>
        {JSON.stringify(rows, null, 2)}
      </pre>
    </main>
  );
}