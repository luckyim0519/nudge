interface ChoiceCardProps {
  emoji: string;
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}

export function ChoiceCard({
  emoji,
  title,
  desc,
  selected,
  onClick,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
        selected ? "border-amber bg-amber/5" : "border-sand bg-white"
      }`}
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="font-medium text-dark text-sm leading-snug">{title}</div>
      <div className="text-xs text-dark/50 mt-1 leading-relaxed">{desc}</div>
    </button>
  );
}
