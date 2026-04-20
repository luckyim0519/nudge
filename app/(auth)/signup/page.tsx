"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/auth/LogoMark";
import { ProgressDots } from "@/components/auth/ProgressDots";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    form?: string;
  }>({});

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "이름을 입력해주세요";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "올바른 이메일을 입력해주세요";
    if (password.length < 8) e.password = "비밀번호는 8자 이상이어야 해요";
    return e;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    const supabase = createClient();

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (signupError) {
      setErrors({ form: signupError.message });
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, name });
      router.push("/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px]">
        {/* Header */}
        <div className="text-center mb-8">
          <LogoMark />
          <div className="mt-6">
            <ProgressDots step={1} />
          </div>
        </div>

        <h1 className="font-display text-3xl text-dark mb-1">시작해볼까요</h1>
        <p className="text-sm mb-7" style={{ color: "#B0A090" }}>
          친구들과 함께 기록하는 공간이에요
        </p>

        <form onSubmit={handleSignup} className="space-y-3" noValidate>
          {/* Name */}
          <div>
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-sand bg-[#F0E9E0] text-dark placeholder:text-dark/30 focus:outline-none focus:border-amber transition-colors"
            />
            {errors.name && (
              <p className="text-spark text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-sand bg-[#F0E9E0] text-dark placeholder:text-dark/30 focus:outline-none focus:border-amber transition-colors"
            />
            {errors.email && (
              <p className="text-spark text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="비밀번호 (8자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-sand bg-[#F0E9E0] text-dark placeholder:text-dark/30 focus:outline-none focus:border-amber transition-colors"
            />
            {errors.password && (
              <p className="text-spark text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {errors.form && <p className="text-spark text-xs">{errors.form}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-dark text-cream font-medium text-sm disabled:opacity-50 mt-1"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "#B0A090" }}>
          이미 계정이 있어요{" "}
          <Link href="/login" className="text-amber font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
