import { redirect } from "next/navigation";
import FeedClient from "./FeedClient";
import { DEMO_MODE, demoGroup, demoPosts, demoReactions, demoProfile } from "@/lib/demo-data";

export default async function FeedPage() {
  if (DEMO_MODE) {
    return (
      <FeedClient
        initialPosts={demoPosts}
        initialReactions={demoReactions}
        group={demoGroup}
        currentUserId="user-1"
        currentUserProfile={demoProfile}
      />
    );
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("group_members")
    .select("group_id, groups(id, name, invite_code)")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/onboarding");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const group = ((membership as any).groups as { id: string; name: string; invite_code: string } | null);
  if (!group) redirect("/onboarding");

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profile:profiles(*)")
    .eq("group_id", group.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const postIds = (posts || []).map((p) => p.id);
  const { data: reactions } = postIds.length
    ? await supabase.from("reactions").select("*").in("post_id", postIds)
    : { data: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  return (
    <FeedClient
      initialPosts={posts || []}
      initialReactions={reactions || []}
      group={group}
      currentUserId={user.id}
      currentUserProfile={profile}
    />
  );
}
