export interface Profile {
  id: string;
  name: string;
  member_color: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
  profile?: Profile;
}

export interface Post {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  photo_url: string | null;
  created_at: string;
  profile?: Profile;
  reactions?: Reaction[];
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface ReactionCount {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface CommunityCategory {
  id: string;
  name: string;
  emoji: string;
  slug: string;
  post_count: number;
}

export interface CommunityPost {
  id: string;
  category_id: string;
  tag: string;
  title: string;
  preview: string;
  view_count: number;
  comment_count: number;
  created_at: string;
}

export const EMOJIS = ["👏", "🔥", "😂", "💪", "❤️", "🎉"] as const;
export type EmojiType = (typeof EMOJIS)[number];

export const MEMBER_COLORS = [
  "#7B6FA0", // purple
  "#4A8C6F", // green
  "#C9503A", // coral
  "#5A82B4", // blue
  "#B8860B", // gold
  "#6B8E6B", // sage
  "#A0522D", // sienna
  "#4682B4", // steel blue
] as const;
