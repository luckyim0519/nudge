import { MEMBER_COLORS } from "./types";

export function assignMemberColor(usedColors: (string | null)[]): string {
  const used = new Set(usedColors.filter(Boolean));
  return (
    MEMBER_COLORS.find((c) => !used.has(c)) ??
    MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)]
  );
}
