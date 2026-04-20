import type { Profile } from "@/lib/types";

interface MemberPreviewProps {
  groupName: string;
  memberCount: number;
  members: Profile[];
}

export function MemberPreview({
  groupName,
  memberCount,
  members,
}: MemberPreviewProps) {
  return (
    <div className="w-full rounded-2xl bg-sand p-4">
      <div className="text-sm font-medium text-dark">{groupName}</div>
      <div className="text-xs text-dark/50 mt-0.5">{memberCount}명의 멤버</div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {members.map((m) => (
          <span
            key={m.id}
            className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: m.member_color || "#B0A090" }}
          >
            {m.name}
          </span>
        ))}
      </div>
    </div>
  );
}
