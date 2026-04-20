interface CodeDisplayProps {
  code: string;
}

export function CodeDisplay({ code }: CodeDisplayProps) {
  return (
    <div className="w-full rounded-2xl bg-dark p-6 text-center">
      <p
        className="text-[10px] uppercase tracking-widest mb-2"
        style={{ color: "#B0A090" }}
      >
        액세스 코드
      </p>
      <p className="font-display text-3xl text-amber tracking-[4px]">{code}</p>
      <p className="text-xs mt-2" style={{ color: "#B0A090" }}>
        친구들한테 이 코드를 알려주세요
      </p>
    </div>
  );
}
