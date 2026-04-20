"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Flame } from "lucide-react";
import { format, subDays, isSameDay, startOfMonth } from "date-fns";
import { ko } from "date-fns/locale";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { Post, Profile } from "@/lib/types";

type Tab = "all" | "photos";

interface ProfileClientProps {
  profile: Profile | null;
  groupName: string | null;
  posts: (Post & { reactions: { emoji: string }[] })[];
  userId: string;
}

export default function ProfileClient({ profile, groupName, posts }: ProfileClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Stats
  const totalPosts = posts.length;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const postsThisMonth = posts.filter((p) => new Date(p.created_at) >= monthStart).length;

  // Streak calculation
  let streak = 0;
  let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (true) {
    const hasPost = posts.some((p) => isSameDay(new Date(p.created_at), checkDate));
    if (!hasPost) break;
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  // Last 7 days for bar chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(now, 6 - i);
    const hasPost = posts.some((p) => isSameDay(new Date(p.created_at), d));
    return { date: d, hasPost };
  });

  const photoPosts = posts.filter((p) => p.photo_url);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl text-dark">내 기록</h1>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center text-dark/30"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl p-4 border border-sand/50 flex items-center gap-4">
          <Avatar name={profile?.name || "?"} color={profile?.member_color} size="lg" />
          <div>
            <div className="font-semibold text-dark text-base">{profile?.name}</div>
            {groupName && (
              <div className="text-xs text-dark/40 mt-0.5">📍 {groupName}</div>
            )}
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "전체 글", value: totalPosts },
            { label: "연속 🔥", value: streak },
            { label: "이번 달", value: postsThisMonth },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-3 border border-sand/50 text-center">
              <div className="font-display text-2xl text-dark">{value}</div>
              <div className="text-xs text-dark/40 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly chart */}
      <div className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-sand/50">
        <div className="text-xs font-semibold text-dark/40 mb-3">최근 7일</div>
        <div className="flex items-end gap-1.5 h-12">
          {last7.map(({ date, hasPost }, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-md transition-all ${
                  hasPost ? "bg-amber" : "bg-sand"
                }`}
                style={{ height: hasPost ? "100%" : "20%" }}
              />
              <span className="text-[9px] text-dark/30">
                {format(date, "E", { locale: ko })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-sand mx-4 rounded-xl p-1 mb-3">
        {(["all", "photos"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-dark shadow-sm" : "text-dark/50"
            }`}
          >
            {t === "all" ? "전체 일기" : "사진 모아보기"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "all" ? (
        <div className="flex-1 px-4 pb-6 space-y-2">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-sm text-dark/30">아직 기록이 없어요</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl p-3.5 border border-sand/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-dark/30">
                    {format(new Date(post.created_at), "M월 d일 (EEE)", { locale: ko })}
                  </span>
                </div>
                <p className="text-sm text-dark leading-relaxed">{post.content}</p>
                {post.photo_url && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden mt-2 bg-sand">
                    <Image src={post.photo_url} alt="" fill className="object-cover" />
                  </div>
                )}
                {post.reactions && post.reactions.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {Object.entries(
                      post.reactions.reduce<Record<string, number>>((acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([emoji, count]) => (
                      <span key={emoji} className="text-xs bg-sand/50 px-2 py-0.5 rounded-full">
                        {emoji} {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 px-4 pb-6">
          {photoPosts.length === 0 ? (
            <div className="text-center py-12 text-sm text-dark/30">사진이 있는 글이 없어요</div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {photoPosts.map((post) => (
                <div key={post.id} className="relative aspect-square bg-sand overflow-hidden">
                  <Image src={post.photo_url!} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
