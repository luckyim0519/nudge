import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Eye, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const MOCK_TAGS: Record<string, string[]> = {
  "career-change": ["이직준비", "연봉협상", "포트폴리오", "면접후기"],
  "job-hunting": ["서류준비", "자소서", "면접", "합격후기"],
  study: ["자격증", "영어", "코딩", "독서"],
  stocks: ["국내주식", "해외주식", "ETF", "일지"],
  fitness: ["헬스", "러닝", "식단", "챌린지"],
};

const MOCK_POSTS: Record<string, Array<{
  id: string; tag: string; title: string; preview: string; view_count: number; comment_count: number; created_at: string;
}>> = {
  study: [
    { id: "1", tag: "코딩", title: "오늘 알고리즘 문제 3개 풀었다", preview: "백준 실버 2 통과... 어제보다 확실히 빨라진 것 같아서 기분 좋다. 그리디 유형을 집중적으로 파야겠다.", view_count: 234, comment_count: 12, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "2", tag: "자격증", title: "정보처리기사 필기 D-7", preview: "오늘은 데이터베이스 파트 2회독 완료. 트랜잭션 개념이 드디어 좀 잡히는 느낌이다 ㅠㅠ", view_count: 891, comment_count: 28, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: "3", tag: "영어", title: "토익 900 달성 후기", preview: "3개월 동안 매일 2시간씩 공부한 결과... LC 450 RC 455 받았습니다! 이제 스피킹 준비해야지", view_count: 1823, comment_count: 67, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "4", tag: "독서", title: "아토믹 해빗 독서 일지 23일차", preview: "습관의 시스템화에 대한 챕터 읽었는데 진짜 공감 100%. 작은 변화가 쌓이면 엄청난 결과가...", view_count: 156, comment_count: 8, created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: "5", tag: "코딩", title: "리액트 프로젝트 배포 완료 🎉", preview: "넥스트JS로 만든 첫 번째 풀스택 앱 배포했다. Vercel 진짜 쉽다... 다음 목표는 인증 구현", view_count: 445, comment_count: 19, created_at: new Date(Date.now() - 259200000).toISOString() },
  ],
  "job-hunting": [
    { id: "6", tag: "합격후기", title: "카카오 최종 합격 후기 (신입)", preview: "코테 → 1차 → 2차 → 최종까지 총 6주 걸렸어요. 코테는 파이썬으로 3문제 중 2.5개 풀었고...", view_count: 5231, comment_count: 142, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: "7", tag: "자소서", title: "자소서 첫 문장이 제일 어렵다", preview: "7번째 지원인데 아직도 자소서 첫 문장 쓸 때마다 멍해진다. 오늘도 3시간 앉아있다가 한 줄 썼어요", view_count: 678, comment_count: 33, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "8", tag: "면접", title: "스타트업 임원 면접 후기", preview: "예상치 못한 질문들을 많이 받았다. '5년 후 비전'보다 '왜 여기에 오고 싶냐'를 훨씬 많이...", view_count: 1102, comment_count: 45, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  ],
  "career-change": [
    { id: "9", tag: "연봉협상", title: "이직 연봉 40% 올린 후기", preview: "현재 연봉 대비 40% 올려서 이직 성공했습니다. 핵심은 레퍼런스 체크 전에 오퍼 받는 것...", view_count: 9823, comment_count: 287, created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
    { id: "10", tag: "포트폴리오", title: "개발자 포트폴리오 피드백 받아보니", preview: "스터디원한테 포트폴리오 봐달라고 했더니 프로젝트 설명이 너무 기술 위주라고 하더라. 임팩트를...", view_count: 2341, comment_count: 78, created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
  stocks: [
    { id: "11", tag: "일지", title: "오늘 주식 일지 — 횡보장 대응법", preview: "3주째 횡보중인 포트폴리오... 이럴 때일수록 분할 매수 원칙 지키는 게 맞는 것 같다", view_count: 312, comment_count: 15, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "12", tag: "ETF", title: "S&P500 ETF 적립식 투자 6개월 결산", preview: "매달 30만원씩 6개월 동안 꾸준히 넣었더니 수익률 +8.2%. 환율 영향이 생각보다 크더라...", view_count: 1567, comment_count: 52, created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
  ],
  fitness: [
    { id: "13", tag: "헬스", title: "100일 헬스 챌린지 완료 💪", preview: "3월 1일부터 시작해서 오늘 드디어 100일차! 처음엔 벤치프레스 30kg도 힘들었는데 지금은 70kg...", view_count: 3421, comment_count: 98, created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
    { id: "14", tag: "러닝", title: "처음으로 하프마라톤 완주!", preview: "2시간 12분으로 완주했어요!! 작년 이맘때 5km도 힘들었던 사람이 이렇게 됐네요 ㅠㅠ 감사해요", view_count: 2104, comment_count: 61, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "15", tag: "식단", title: "다이어트 식단 2달차 후기", preview: "탄수화물 줄이고 단백질 위주 식단으로 바꿨더니 -5kg 달성. 닭가슴살 레시피 공유할게요!", view_count: 876, comment_count: 34, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  ],
};

const CATEGORY_NAMES: Record<string, { name: string; emoji: string }> = {
  study: { name: "공부", emoji: "📚" },
  "job-hunting": { name: "취준", emoji: "📝" },
  "career-change": { name: "이직", emoji: "💼" },
  stocks: { name: "주식", emoji: "📈" },
  fitness: { name: "운동", emoji: "🏋️" },
};

export default async function CommunitySlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const { slug } = await params;
  const { tag: activeTag } = await searchParams;

  const supabase = await createClient();
  const { data: category } = await supabase
    .from("community_categories")
    .select()
    .eq("slug", slug)
    .single();

  const tags = MOCK_TAGS[slug] || [];
  const allPosts = MOCK_POSTS[slug] || [];
  const posts = activeTag ? allPosts.filter((p) => p.tag === activeTag) : allPosts;
  const catInfo = CATEGORY_NAMES[slug];

  if (!catInfo && !category) notFound();

  const name = category?.name || catInfo?.name || slug;
  const emoji = category?.emoji || catInfo?.emoji || "📌";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 pt-12 pb-3 bg-cream/90 backdrop-blur-sm sticky top-0 z-10 border-b border-sand/50">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/community" className="text-dark/40">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="font-display text-xl text-dark">
            {emoji} {name}
          </h1>
        </div>
        {/* Tag tabs */}
        {tags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <Link
              href={`/community/${slug}`}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !activeTag ? "bg-dark text-cream" : "bg-sand text-dark/60"
              }`}
            >
              전체
            </Link>
            {tags.map((t) => (
              <Link
                key={t}
                href={`/community/${slug}?tag=${t}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeTag === t ? "bg-dark text-cream" : "bg-sand text-dark/60"
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto divide-y divide-sand/50">
        {posts.map((post) => (
          <div key={post.id} className="px-4 py-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber/10 text-amber font-medium">
                {post.tag}
              </span>
            </div>
            <h3 className="font-semibold text-dark text-sm mb-1">{post.title}</h3>
            <p className="text-xs text-dark/50 leading-relaxed line-clamp-2 mb-2">{post.preview}</p>
            <div className="flex items-center gap-3 text-xs text-dark/30">
              <span className="flex items-center gap-1">
                <Eye size={12} />
                {post.view_count.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={12} />
                {post.comment_count}
              </span>
              <span>
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
