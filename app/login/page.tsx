"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    try {
      setLoading(true);
      setMessage("");

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">

        <h1 className="text-3xl font-bold mb-2">
          Login
        </h1>

        <p className="text-slate-400 mb-6">
          Sign in to your LifeLens account
        </p>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

          {message && (
            <div className="bg-slate-800 p-3 rounded-lg">
              {message}
            </div>
          )}

        </div>

        <div className="mt-6 text-center">
          <a
            href="/register"
            className="text-blue-400 hover:text-blue-300"
          >
            Create a new account
          </a>
        </div>

      </div>
    </main>
  );
}