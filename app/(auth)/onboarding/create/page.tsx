"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/auth/LogoMark";
import { ProgressDots } from "@/components/auth/ProgressDots";
import { CodeDisplay } from "@/components/auth/CodeDisplay";
import { generateInviteCode } from "@/lib/generateInviteCode";
import { MEMBER_COLORS } from "@/lib/types";

export default function CreatePage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const code = generateInviteCode();

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({ name: roomName, invite_code: code, created_by: user.id })
      .select()
      .single();

    if (groupError || !group) {
      setError(groupError?.message ?? "오류가 발생했어요");
      setLoading(false);
      return;
    }

    await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: user.id });
    await supabase
      .from("profiles")
      .update({ member_color: MEMBER_COLORS[0] })
      .eq("id", user.id);

    setGeneratedCode(code);
    setLoading(false);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: "Nudge 스터디방",
        text: `Nudge 스터디방 코드: ${generatedCode}`,
      });
    } else {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px]">
        {/* Header */}
        <div className="text-center mb-8">
          <LogoMark />
          <div className="mt-6">
            <ProgressDots step={3} />
          </div>
        </div>

        {!generatedCode ? (
          <>
            <h1 className="font-display text-3xl text-dark mb-1">
              스터디방 이름 정해요
            </h1>
            <p className="text-sm mb-6" style={{ color: "#B0A090" }}>
              나중에 바꿀 수 있어요
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="우리 취준 스터디 👊"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-sand bg-[#F0E9E0] text-dark placeholder:text-dark/30 focus:outline-none focus:border-amber transition-colors"
              />
              {error && <p className="text-spark text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-dark text-cream font-medium text-sm disabled:opacity-50"
              >
                {loading ? "만드는 중..." : "만들기"}
              </button>
            </form>

            <Link
              href="/onboarding"
              className="block text-center text-sm mt-4"
              style={{ color: "#B0A090" }}
            >
              ← 다시 선택하기
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl text-dark mb-1">
              방이 만들어졌어요! 🎉
            </h1>
            <p className="text-sm mb-6" style={{ color: "#B0A090" }}>
              아래 코드를 친구들한테 공유해요
            </p>

            <CodeDisplay code={generatedCode} />

            <div className="space-y-3 mt-4">
              <button
                onClick={handleShare}
                className="w-full h-12 rounded-xl border border-sand bg-white text-dark font-medium text-sm"
              >
                {copied ? "코드 복사됨! ✓" : "코드 공유하기 📤"}
              </button>
              <button
                onClick={() => router.push("/feed")}
                className="w-full h-12 rounded-xl bg-amber text-dark font-medium text-sm"
              >
                피드로 이동 →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
