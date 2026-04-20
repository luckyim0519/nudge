"use client";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function CodeInput({ value, onChange }: CodeInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip anything that isn't alphanumeric, take first 7 chars, uppercase
    const raw = e.target.value
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 7);

    // Auto-insert middle dot after position 3
    const formatted = raw.length > 3 ? raw.slice(0, 3) + "·" + raw.slice(3) : raw;
    onChange(formatted);
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="NUD·XXXX"
      maxLength={8}
      autoCapitalize="characters"
      className="w-full h-16 px-6 rounded-xl border-2 border-sand bg-[#F0E9E0] text-dark text-center font-display text-2xl tracking-[4px] focus:outline-none focus:border-amber transition-colors uppercase"
    />
  );
}
