"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { Post, ReactionCount, EMOJIS } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  reactionCounts: ReactionCount[];
  onDelete?: (postId: string) => void;
}

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function PostCard({ post, currentUserId, reactionCounts: initialCounts, onDelete }: PostCardProps) {
  const [counts, setCounts] = useState<ReactionCount[]>(initialCounts);
  const [showEmojis, setShowEmojis] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("이 글을 삭제할까요?")) return;
    setDeleting(true);
    if (!DEMO_MODE) {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("posts").delete().eq("id", post.id);
    }
    onDelete?.(post.id);
  }

  async function toggleReaction(emoji: string) {
    const existing = counts.find((c) => c.emoji === emoji);

    if (existing?.reacted) {
      if (!DEMO_MODE) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.from("reactions").delete().match({ post_id: post.id, user_id: currentUserId, emoji });
      }
      setCounts((prev) =>
        prev.map((c) => c.emoji === emoji ? { ...c, count: c.count - 1, reacted: false } : c)
      );
    } else {
      if (!DEMO_MODE) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.from("reactions").insert({ post_id: post.id, user_id: currentUserId, emoji });
      }
      setCounts((prev) => {
        const found = prev.find((c) => c.emoji === emoji);
        if (found) return prev.map((c) => c.emoji === emoji ? { ...c, count: c.count + 1, reacted: true } : c);
        return [...prev, { emoji, count: 1, reacted: true }];
      });
    }
    setShowEmojis(false);
  }

  const profile = post.profile;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko });
  const displayedCounts = counts.filter((c) => c.count > 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/50">
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar name={profile?.name || "?"} color={profile?.member_color} size="sm" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-dark">{profile?.name}</span>
        </div>
        <span className="text-xs text-dark/30">{timeAgo}</span>
        {post.user_id === currentUserId && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-7 h-7 flex items-center justify-center text-dark/20 hover:text-spark transition-colors disabled:opacity-30"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <p className="text-sm text-dark leading-relaxed mb-3">{post.content}</p>

      {post.photo_url && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-sand">
          <Image src={post.photo_url} alt="post photo" fill className="object-cover" />
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        {displayedCounts.map((rc) => (
          <button
            key={rc.emoji}
            onClick={() => toggleReaction(rc.emoji)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${
              rc.reacted ? "bg-amber/10 border-amber/30 text-dark" : "bg-sand/50 border-sand text-dark/60"
            }`}
          >
            <span>{rc.emoji}</span>
            <span className="font-medium">{rc.count}</span>
          </button>
        ))}

        <div className="relative">
          <button
            onClick={() => setShowEmojis(!showEmojis)}
            className="w-7 h-7 rounded-full bg-sand/50 border border-sand flex items-center justify-center text-xs text-dark/40"
          >
            +
          </button>
          {showEmojis && (
            <div className="absolute bottom-9 left-0 bg-white rounded-2xl shadow-lg border border-sand p-2 flex gap-1 z-10">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-sand rounded-xl transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
