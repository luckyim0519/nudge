"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/auth/LogoMark";

export default function LoginPage() {
  const router = useRouter();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleApple() {
    setLoading("apple");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleGoogle() {
    setLoading("google");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading("email");
    setError("");
    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setError(loginError.message);
      setLoading(null);
    } else {
      router.push("/feed");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <LogoMark size="lg" />
          <h1 className="font-display text-3xl text-dark mt-3">Nudge</h1>
          <p className="text-sm mt-1" style={{ color: "#B0A090" }}>
            야, 오늘 했어?
          </p>
        </div>

        {!showEmailForm ? (
          <div className="space-y-3">
            {/* Apple */}
            <button
              onClick={handleApple}
              disabled={loading !== null}
              className="w-full h-12 rounded-xl bg-dark text-cream font-medium text-sm flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <svg width="17" height="20" viewBox="0 0 17 20" fill="currentColor">
                <path d="M13.74 10.53c-.02-2.14 1.75-3.17 1.83-3.22-1-1.46-2.55-1.66-3.1-1.68-1.32-.13-2.58.77-3.25.77-.67 0-1.7-.75-2.8-.73-1.44.02-2.77.84-3.51 2.12-1.5 2.6-.38 6.44 1.07 8.55.72 1.03 1.57 2.19 2.69 2.15 1.08-.04 1.49-.7 2.8-.7 1.3 0 1.67.7 2.81.67 1.16-.02 1.9-1.05 2.6-2.09.82-1.19 1.16-2.35 1.18-2.41-.03-.01-2.3-.88-2.32-3.43zM11.6 3.88c.6-.72 1-1.72.89-2.72-.86.04-1.9.57-2.52 1.28-.55.63-1.04 1.64-.91 2.6.96.07 1.94-.48 2.54-1.16z" />
              </svg>
              {loading === "apple" ? "연결 중..." : "Apple로 계속하기"}
            </button>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading !== null}
              className="w-full h-12 rounded-xl bg-white border border-sand font-medium text-sm text-dark flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
              {loading === "google" ? "연결 중..." : "Google로 계속하기"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-sand" />
              <span className="text-xs text-dark/30">또는</span>
              <div className="flex-1 h-px bg-sand" />
            </div>

            {/* Email signup */}
            <Link
              href="/signup"
              className="w-full h-12 rounded-xl bg-[#F0E9E0] font-medium text-sm text-dark flex items-center justify-center gap-2"
            >
              ✉️ 이메일로 가입하기
            </Link>

            {/* Already have account */}
            <p className="text-center text-xs text-dark/40 pt-1">
              이미 계정이 있으신가요?{" "}
              <button
                onClick={() => setShowEmailForm(true)}
                className="text-amber font-medium underline-offset-2 hover:underline"
              >
                로그인
              </button>
            </p>
          </div>
        ) : (
          <div>
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-sand bg-[#F0E9E0] text-dark placeholder:text-dark/30 focus:outline-none focus:border-amber transition-colors"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-sand bg-[#F0E9E0] text-dark placeholder:text-dark/30 focus:outline-none focus:border-amber transition-colors"
              />
              {error && <p className="text-spark text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading !== null}
                className="w-full h-12 rounded-xl bg-dark text-cream font-medium text-sm disabled:opacity-50"
              >
                {loading === "email" ? "로그인 중..." : "로그인"}
              </button>
            </form>

            <button
              onClick={() => setShowEmailForm(false)}
              className="block text-center text-sm text-dark/40 mt-4 w-full"
            >
              ← 다른 방법으로 로그인
            </button>
          </div>
        )}

        {/* Fine print */}
        <p className="text-center text-[11px] text-dark/30 mt-8">
          가입 시 이용약관에 동의하는 것으로 간주됩니다
        </p>
      </div>
    </div>
  );
}
