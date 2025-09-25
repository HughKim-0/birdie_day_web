"use client";

import { createSupabaseBrowser } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
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
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      router.push("/login");
    } catch (err: any) {
      setError(err?.message ?? "Sign-up failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#8c9a79" }}>
      <form onSubmit={onSubmit} className="w-full max-w-sm px-6 space-y-6">
        <h2 className="text-3xl font-bold mb-4">Create account</h2>
        <input className="w-full border-b border-black bg-transparent px-2 py-1" placeholder="Email"
          type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border-b border-black bg-transparent px-2 py-1" placeholder="Password"
          type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button disabled={pending} className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800">
          {pending ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </main>
  );
}
