"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calendar, User } from "lucide-react";

// TODO v2: re-enable community tab
// import { Globe } from "lucide-react";

const NAV_ITEMS = [
  { href: "/feed", icon: BookOpen, label: "피드" },
  { href: "/calendar", icon: Calendar, label: "캘린더" },
  { href: "/profile", icon: User, label: "내 기록" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-sand pb-safe-area-inset-bottom">
      <div className="flex">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors ${
                active ? "text-amber" : "text-dark/30"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
