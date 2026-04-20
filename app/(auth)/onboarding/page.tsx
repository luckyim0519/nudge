"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/auth/LogoMark";
import { ProgressDots } from "@/components/auth/ProgressDots";
import { ChoiceCard } from "@/components/auth/ChoiceCard";

type Choice = "join" | "create";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Choice>("join");

  function handleContinue() {
    if (selected === "join") {
      router.push("/onboarding/join");
    } else {
      router.push("/onboarding/create");
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px]">
        {/* Header */}
        <div className="text-center mb-8">
          <LogoMark />
          <div className="mt-6">
            <ProgressDots step={2} />
          </div>
        </div>

        <h1 className="font-display text-3xl text-dark mb-1">
          그룹을 어떻게 할까요?
        </h1>
        <p className="text-sm mb-7" style={{ color: "#B0A090" }}>
          친구 코드로 입장하거나 새 방을 만들어요
        </p>

        <div className="space-y-3">
          <ChoiceCard
            emoji="🔑"
            title="액세스 코드로 입장"
            desc="친구한테 받은 6자리 코드를 입력하면 바로 들어갈 수 있어요"
            selected={selected === "join"}
            onClick={() => setSelected("join")}
          />
          <ChoiceCard
            emoji="✨"
            title="새 스터디방 만들기"
            desc="내가 방을 만들고 친구들을 초대해요. 코드가 자동으로 생성돼요"
            selected={selected === "create"}
            onClick={() => setSelected("create")}
          />
        </div>

        <button
          onClick={handleContinue}
          className="w-full h-12 rounded-xl bg-dark text-cream font-medium text-sm mt-6"
        >
          계속하기 →
        </button>
      </div>
    </div>
  );
}
