"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/auth/LogoMark";
import { ProgressDots } from "@/components/auth/ProgressDots";
import { CodeInput } from "@/components/auth/CodeInput";
import { MemberPreview } from "@/components/auth/MemberPreview";
import { assignMemberColor } from "@/lib/assignMemberColor";
import type { Profile } from "@/lib/types";

interface GroupPreview {
  id: string;
  name: string;
  members: Profile[];
}

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<GroupPreview | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    // Only look up when code is fully formatted (NUD·XXXX = 8 chars)
    if (code.length < 8) {
      setPreview(null);
      setLookupError("");
      return;
    }

    let cancelled = false;

    async function lookupGroup() {
      const supabase = createClient();

      const { data: group } = await supabase
        .from("groups")
        .select("id, name")
        .eq("invite_code", code)
        .maybeSingle();

      if (cancelled) return;

      if (!group) {
        setPreview(null);
        setLookupError("코드를 찾을 수 없어요");
        return;
      }

      const { data: memberships } = await supabase
        .from("group_members")
        .select("user_id, profiles(id, name, member_color, created_at)")
        .eq("group_id", group.id);

      if (cancelled) return;

      const members = (memberships ?? [])
        .map((m) => {
          const p = (m as unknown as { profiles: Profile | Profile[] }).profiles;
          return Array.isArray(p) ? p[0] : p;
        })
        .filter(Boolean) as Profile[];

      setPreview({ id: group.id, name: group.name, members });
      setLookupError("");
    }

    const timer = setTimeout(lookupGroup, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code]);

  async function handleJoin() {
    if (!preview) return;
    setJoining(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const usedColors = preview.members.map((m) => m.member_color);
    const color = assignMemberColor(usedColors);

    await supabase
      .from("group_members")
      .insert({ group_id: preview.id, user_id: user.id });
    await supabase
      .from("profiles")
      .update({ member_color: color })
      .eq("id", user.id);

    router.push("/feed");
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

        <h1 className="font-display text-3xl text-dark mb-1">
          코드를 입력해줘요
        </h1>
        <p className="text-sm mb-6" style={{ color: "#B0A090" }}>
          친구한테 받은 6자리 코드
        </p>

        <CodeInput value={code} onChange={setCode} />

        {lookupError && (
          <p className="text-spark text-xs mt-2">{lookupError}</p>
        )}

        {preview && (
          <div className="mt-4">
            <MemberPreview
              groupName={preview.name}
              memberCount={preview.members.length}
              members={preview.members}
            />
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={!preview || joining}
          className="w-full h-12 rounded-xl bg-amber text-dark font-medium text-sm mt-4 disabled:opacity-40 transition-opacity"
        >
          {joining ? "입장 중..." : "입장하기 🎉"}
        </button>

        <Link
          href="/onboarding"
          className="block text-center text-sm mt-4"
          style={{ color: "#B0A090" }}
        >
          ← 다시 선택하기
        </Link>
      </div>
    </div>
  );
}
