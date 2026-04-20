"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import PostForm from "@/components/feed/PostForm";
import Avatar from "@/components/ui/Avatar";
import { Post, Reaction, ReactionCount, EMOJIS, Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface FeedClientProps {
  initialPosts: Post[];
  initialReactions: Reaction[];
  group: { id: string; name: string; invite_code: string };
  currentUserId: string;
  currentUserProfile: Profile | null;
}

function buildReactionCounts(reactions: Reaction[], postId: string, userId: string): ReactionCount[] {
  const postReactions = reactions.filter((r) => r.post_id === postId);
  const emojiMap = new Map<string, { count: number; reacted: boolean }>();

  for (const r of postReactions) {
    const existing = emojiMap.get(r.emoji) || { count: 0, reacted: false };
    emojiMap.set(r.emoji, {
      count: existing.count + 1,
      reacted: existing.reacted || r.user_id === userId,
    });
  }

  return EMOJIS.map((emoji) => ({
    emoji,
    count: emojiMap.get(emoji)?.count || 0,
    reacted: emojiMap.get(emoji)?.reacted || false,
  }));
}

export default function FeedClient({
  initialPosts,
  initialReactions,
  group,
  currentUserId,
  currentUserProfile,
}: FeedClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [copied, setCopied] = useState(false);

  const refreshPosts = useCallback(async () => {
    const supabase = createClient();
    const { data: newPosts } = await supabase
      .from("posts")
      .select("*, profile:profiles(*)")
      .eq("group_id", group.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (newPosts) {
      setPosts(newPosts);
      const postIds = newPosts.map((p) => p.id);
      if (postIds.length) {
        const { data: newReactions } = await supabase
          .from("reactions")
          .select("*")
          .in("post_id", postIds);
        setReactions(newReactions || []);
      }
    }
  }, [group.id]);

  // Real-time sync
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`feed:${group.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts", filter: `group_id=eq.${group.id}` },
        async () => { await refreshPosts(); }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts", filter: `group_id=eq.${group.id}` },
        (payload) => {
          setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reactions" },
        async () => { await refreshPosts(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [group.id, refreshPosts]);

  async function copyInviteCode() {
    await navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cream/90 backdrop-blur-sm px-4 pt-12 pb-3 border-b border-sand/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-dark">{group.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Avatar
              name={currentUserProfile?.name || "?"}
              color={currentUserProfile?.member_color}
              size="sm"
            />
            <button
              onClick={copyInviteCode}
              className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-sand text-xs font-medium text-dark"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {group.invite_code}
            </button>
          </div>
        </div>
      </header>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">✏️</p>
            <p className="text-sm text-dark/40">아직 글이 없어요.</p>
            <p className="text-sm text-dark/30">첫 기록을 남겨보세요!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              reactionCounts={buildReactionCounts(reactions, post.id, currentUserId)}
              onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
            />
          ))
        )}
      </div>

      {/* Post form */}
      <PostForm groupId={group.id} userId={currentUserId} onPosted={refreshPosts} />
    </div>
  );
}
