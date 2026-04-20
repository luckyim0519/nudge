import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import { DEMO_MODE, demoProfile, demoGroup, demoPosts } from "@/lib/demo-data";

export default async function ProfilePage() {
  if (DEMO_MODE) {
    // Add some reactions to demo posts for profile view
    const postsWithReactions = demoPosts
      .filter((p) => p.user_id === "user-1")
      .map((p) => ({ ...p, reactions: [{ emoji: "🔥" }, { emoji: "👏" }] }));

    return (
      <ProfileClient
        profile={demoProfile}
        groupName={demoGroup.name}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        posts={postsWithReactions as any}
        userId="user-1"
      />
    );
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  const { data: membership } = await supabase
    .from("group_members")
    .select("group_id, groups(name)")
    .eq("user_id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupName = ((membership as any)?.groups as { name: string } | null)?.name || null;

  const { data: posts } = await supabase
    .from("posts")
    .select("*, reactions(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <ProfileClient
      profile={profile}
      groupName={groupName}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      posts={(posts || []) as any}
      userId={user.id}
    />
  );
}
