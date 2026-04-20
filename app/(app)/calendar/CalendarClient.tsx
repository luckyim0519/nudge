"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { ko } from "date-fns/locale";
import Avatar from "@/components/ui/Avatar";

interface PostBrief {
  id: string;
  user_id: string;
  created_at: string;
  content: string;
  photo_url: string | null;
  profile: { name: string; member_color: string | null } | null;
}

interface Member {
  user_id: string;
  profiles: { id: string; name: string; member_color: string | null } | null;
}

interface CalendarClientProps {
  groupId: string;
  groupName: string;
  members: Member[];
  posts: PostBrief[];
  currentUserId: string;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarClient({ groupName, members, posts }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start
  const startPad = getDay(monthStart);
  const paddedDays = [...Array(startPad).fill(null), ...days];

  function postsForDay(day: Date): PostBrief[] {
    return posts.filter((p) => isSameDay(new Date(p.created_at), day));
  }

  function userColorsForDay(day: Date): string[] {
    const dayPosts = postsForDay(day);
    const seen = new Set<string>();
    return dayPosts
      .filter((p) => {
        if (seen.has(p.user_id)) return false;
        seen.add(p.user_id);
        return true;
      })
      .map((p) => p.profile?.member_color || "#2C2318")
      .slice(0, 4);
  }

  const selectedPosts = selectedDate ? postsForDay(selectedDate) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 bg-cream/90 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="font-display text-2xl text-dark mb-3">{groupName}</h1>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sand"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-semibold text-dark">
            {format(currentDate, "yyyy년 M월", { locale: ko })}
          </span>
          <button
            onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sand"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {/* Calendar grid */}
      <div className="px-3 pb-6">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs py-1 font-medium ${
                i === 0 ? "text-spark" : i === 6 ? "text-blue-400" : "text-dark/40"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-1">
          {paddedDays.map((day, i) => {
            if (!day) return <div key={`pad-${i}`} />;
            const colors = userColorsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const inMonth = isSameMonth(day, currentDate);
            const dow = getDay(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`flex flex-col items-center py-1.5 rounded-xl transition-colors ${
                  isSelected ? "bg-amber/20" : "hover:bg-sand/50"
                } ${!inMonth ? "opacity-30" : ""}`}
              >
                <span
                  className={`text-sm font-medium leading-none mb-1 ${
                    isToday
                      ? "w-6 h-6 flex items-center justify-center rounded-full bg-dark text-cream"
                      : dow === 0
                      ? "text-spark"
                      : dow === 6
                      ? "text-blue-400"
                      : "text-dark"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="flex gap-0.5 flex-wrap justify-center min-h-[8px]">
                  {colors.map((color, ci) => (
                    <span
                      key={ci}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Member legend */}
      <div className="px-4 pb-4 flex flex-wrap gap-3">
        {members.map((m) => (
          <div key={m.user_id} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: m.profiles?.member_color || "#2C2318" }}
            />
            <span className="text-xs text-dark/50">{m.profiles?.name}</span>
          </div>
        ))}
      </div>

      {/* Day detail sheet */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-end" onClick={() => setSelectedDate(null)}>
          <div
            className="w-full max-w-lg mx-auto bg-cream rounded-t-3xl max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-sand">
              <span className="font-semibold text-dark">
                {format(selectedDate, "M월 d일 (EEEE)", { locale: ko })}
              </span>
              <button onClick={() => setSelectedDate(null)} className="text-dark/40">
                <X size={20} />
              </button>
            </div>
            <div className="px-4 py-3 space-y-3 pb-8">
              {selectedPosts.length === 0 ? (
                <p className="text-center text-sm text-dark/40 py-8">이 날은 기록이 없어요</p>
              ) : (
                selectedPosts.map((p) => (
                  <div key={p.id} className="flex gap-3 items-start bg-white rounded-2xl p-3">
                    <Avatar
                      name={p.profile?.name || "?"}
                      color={p.profile?.member_color}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-dark">{p.profile?.name}</span>
                        <span className="text-xs text-dark/30">
                          {format(new Date(p.created_at), "HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-dark/80 line-clamp-2">{p.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
