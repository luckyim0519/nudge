import { Post, Reaction, Profile, ReactionCount, EMOJIS } from "./types";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const demoProfile: Profile = {
  id: "user-1",
  name: "나",
  member_color: "#F5A623",
  created_at: new Date().toISOString(),
};

export const demoMembers: Profile[] = [
  { id: "user-1", name: "나", member_color: "#F5A623", created_at: "" },
  { id: "user-2", name: "지수", member_color: "#C9503A", created_at: "" },
  { id: "user-3", name: "민준", member_color: "#4A90D9", created_at: "" },
  { id: "user-4", name: "서연", member_color: "#7B5EA7", created_at: "" },
];

const now = Date.now();
const h = 3600000;

export const demoPosts: Post[] = [
  {
    id: "post-1",
    group_id: "group-1",
    user_id: "user-2",
    content: "오늘 백준 골드4 문제 드디어 풀었다 🎉 DP 개념 완전히 잡힌 것 같아서 뿌듯함",
    photo_url: null,
    created_at: new Date(now - 1 * h).toISOString(),
    profile: demoMembers[1],
  },
  {
    id: "post-2",
    group_id: "group-1",
    user_id: "user-1",
    content: "영어 단어 50개 암기 완료! 오늘 토익 목표 달성 ✅",
    photo_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600",
    created_at: new Date(now - 3 * h).toISOString(),
    profile: demoMembers[0],
  },
  {
    id: "post-3",
    group_id: "group-1",
    user_id: "user-3",
    content: "운동 1시간, 독서 30분 완료. 루틴 지키는 게 제일 어렵다는 걸 매일 느낌",
    photo_url: null,
    created_at: new Date(now - 5 * h).toISOString(),
    profile: demoMembers[2],
  },
  {
    id: "post-4",
    group_id: "group-1",
    user_id: "user-4",
    content: "자소서 3개 마무리 💪 이번 주 목표 달성!!",
    photo_url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600",
    created_at: new Date(now - 8 * h).toISOString(),
    profile: demoMembers[3],
  },
  {
    id: "post-5",
    group_id: "group-1",
    user_id: "user-2",
    content: "오늘은 컨디션이 별로라 짧게만 했다. 30분이라도 앉아 있었다는 거에 의미를 두자",
    photo_url: null,
    created_at: new Date(now - 26 * h).toISOString(),
    profile: demoMembers[1],
  },
  {
    id: "post-6",
    group_id: "group-1",
    user_id: "user-3",
    content: "리액트 useEffect 드디어 이해함 😂 클로저 개념이랑 같이 보니까 훨씬 명확해짐",
    photo_url: null,
    created_at: new Date(now - 28 * h).toISOString(),
    profile: demoMembers[2],
  },
];

export const demoReactions: Reaction[] = [
  { id: "r1", post_id: "post-1", user_id: "user-1", emoji: "🔥", created_at: "" },
  { id: "r2", post_id: "post-1", user_id: "user-3", emoji: "🔥", created_at: "" },
  { id: "r3", post_id: "post-1", user_id: "user-4", emoji: "👏", created_at: "" },
  { id: "r4", post_id: "post-2", user_id: "user-2", emoji: "💪", created_at: "" },
  { id: "r5", post_id: "post-2", user_id: "user-3", emoji: "❤️", created_at: "" },
  { id: "r6", post_id: "post-3", user_id: "user-1", emoji: "🎉", created_at: "" },
  { id: "r7", post_id: "post-3", user_id: "user-4", emoji: "👏", created_at: "" },
  { id: "r8", post_id: "post-4", user_id: "user-1", emoji: "🔥", created_at: "" },
  { id: "r9", post_id: "post-4", user_id: "user-2", emoji: "💪", created_at: "" },
];

export function buildDemoReactionCounts(postId: string, userId: string): ReactionCount[] {
  const postReactions = demoReactions.filter((r) => r.post_id === postId);
  const map = new Map<string, { count: number; reacted: boolean }>();
  for (const r of postReactions) {
    const e = map.get(r.emoji) || { count: 0, reacted: false };
    map.set(r.emoji, { count: e.count + 1, reacted: e.reacted || r.user_id === userId });
  }
  return EMOJIS.map((emoji) => ({
    emoji,
    count: map.get(emoji)?.count || 0,
    reacted: map.get(emoji)?.reacted || false,
  }));
}

export const demoGroup = {
  id: "group-1",
  name: "스터디 크루 🔥",
  invite_code: "abc12345",
};
