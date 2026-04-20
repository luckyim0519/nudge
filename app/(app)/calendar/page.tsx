import { redirect } from "next/navigation";
import CalendarClient from "./CalendarClient";
import { DEMO_MODE, demoGroup, demoPosts, demoMembers } from "@/lib/demo-data";

export default async function CalendarPage() {
  if (DEMO_MODE) {
    const members = demoMembers.map((m) => ({
      user_id: m.id,
      profiles: m,
    }));
    return (
      <CalendarClient
        groupId={demoGroup.id}
        groupName={demoGroup.name}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        members={members as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        posts={demoPosts as any}
        currentUserId="user-1"
      />
    );
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("group_members")
    .select("group_id, groups(id, name)")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/onboarding");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const group = ((membership as any).groups as { id: string; name: string } | null);
  if (!group) redirect("/onboarding");

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, profiles(id, name, member_color)")
    .eq("group_id", group.id);

  const { data: posts } = await supabase
    .from("posts")
    .select("id, user_id, created_at, content, photo_url, profile:profiles(name, member_color)")
    .eq("group_id", group.id)
    .order("created_at", { ascending: true });

  return (
    <CalendarClient
      groupId={group.id}
      groupName={group.name}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      members={(members || []) as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      posts={(posts || []) as any}
      currentUserId={user.id}
    />
  );
}
