import Link from "next/link";

const CATEGORIES = [
  { id: "1", name: "이직", emoji: "💼", slug: "career-change", post_count: 128 },
  { id: "2", name: "취준", emoji: "📝", slug: "job-hunting", post_count: 243 },
  { id: "3", name: "공부", emoji: "📚", slug: "study", post_count: 512 },
  { id: "4", name: "주식", emoji: "📈", slug: "stocks", post_count: 87 },
  { id: "5", name: "운동", emoji: "🏋️", slug: "fitness", post_count: 196 },
];

async function getCategories() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return CATEGORIES;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase.from("community_categories").select().order("name");
  return (data && data.length > 0) ? data : CATEGORIES;
}

export default async function CommunityPage() {
  const items = await getCategories();

  return (
    <div className="px-4 pt-12 pb-6">
      <h1 className="font-display text-2xl text-dark mb-1">커뮤니티</h1>
      <p className="text-sm text-dark/40 mb-5">다른 사람들의 기록을 구경해보세요</p>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map((cat) => (
          <Link
            key={cat.id}
            href={`/community/${cat.slug}`}
            className="bg-white rounded-2xl p-3.5 border border-sand/50 hover:border-amber/30 transition-colors flex items-center gap-3"
          >
            <span className="text-2xl leading-none">{cat.emoji}</span>
            <div>
              <div className="font-semibold text-dark text-sm">{cat.name}</div>
              <div className="text-xs text-dark/40 mt-0.5">{cat.post_count.toLocaleString()}개의 글</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
