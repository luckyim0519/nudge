interface AvatarProps {
  name: string;
  color?: string | null;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-14 h-14 text-xl",
};

export default function Avatar({ name, color, size = "md" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${SIZE_MAP[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: color || "#2C2318" }}
    >
      {initials}
    </div>
  );
}
