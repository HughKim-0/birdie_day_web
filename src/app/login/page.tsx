"use client";

import { createSupabaseBrowser } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // 로그인 성공 → 원하는 곳으로 이동
      router.push("/"); // 홈 또는 /account 등으로 바꾸셔도 됨
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Sign-in failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans"
      style={{ backgroundColor: "#8c9a79" }}
    >
      <div className="w-full max-w-sm px-6">
        {/* 로고 (메인과 동일 스타일) */}
        <div className="flex justify-center mb-12">
          <svg viewBox="0 0 700 140" className="block h-16 w-auto" aria-label="Birdie Day">
            <text
              x="20" y="70"
              fontFamily="Anton, Impact, Arial Black, sans-serif"
              fontSize="120"
              fontStyle="italic"
              fill="#e6dfcf"
              stroke="#000"
              strokeWidth="10"
              paintOrder="stroke fill"
              dominantBaseline="middle"
            >
              Birdie Day
            </text>
          </svg>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-b border-black bg-transparent px-2 py-1 focus:outline-none"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-b border-black bg-transparent px-2 py-1 focus:outline-none"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-black text-white py-3 rounded-lg shadow-md hover:bg-gray-800 disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign-In"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Don&apos;t you have an account yet?{" "}
          <a href="/signup" className="font-semibold hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
