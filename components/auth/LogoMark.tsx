interface LogoMarkProps {
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "text-3xl",
  md: "text-5xl",
  lg: "text-6xl",
};

export function LogoMark({ size = "md" }: LogoMarkProps) {
  return (
    <div className="inline-flex items-end gap-1">
      <span className={`font-display ${SIZES[size]} text-dark leading-none`}>
        N
      </span>
      <span className="w-2 h-2 rounded-full bg-amber mb-1.5" />
    </div>
  );
}
