interface ProgressDotsProps {
  step: number;
  total?: number;
}

export function ProgressDots({ step, total = 4 }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i + 1 === step ? "w-6 bg-dark" : "w-2 bg-sand"
          }`}
        />
      ))}
    </div>
  );
}
