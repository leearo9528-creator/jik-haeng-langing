"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const PHONE_REGEX = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const STYLES = {
  label: "block text-[14px] font-semibold text-[#8B95A1] mb-2 ml-1",
  input: "w-full h-[58px] px-5 rounded-[16px] bg-[#F2F4F6] border-none outline-none focus:bg-[#E8F4FF] focus:ring-2 focus:ring-[#3182F6]/20 transition-all font-semibold text-[16px] placeholder:text-[#B0B8C1]",
  select: "w-full h-[58px] px-5 rounded-[16px] bg-[#F2F4F6] border-none outline-none focus:bg-[#E8F4FF] transition-all font-semibold text-[16px] appearance-none cursor-pointer",
} as const;

export default function LandingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    business_name: "",
    category: "푸드트럭",
    phone_number: "",
    region: "전국구(지역상관없음)",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nextValue = name === "phone_number" ? formatPhoneNumber(value) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const phone = formData.phone_number.replace(/\s/g, "");
    if (!PHONE_REGEX.test(phone)) {
      alert("연락처를 올바르게 입력해 주세요. (예: 010-1234-5678)");
      return;
    }

    if (!supabase) {
      alert("서비스 설정이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("sellers").insert([{ ...formData, phone_number: phone }]);
      if (error) {
        if (process.env.NODE_ENV === "development") console.error("Supabase insert error:", error);
        alert("앗, 일시적인 오류가 발생했습니다. 다시 시도해 주세요!");
      } else {
        setIsSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "직결 - 수수료 0원 행사 매칭 플랫폼",
      text: "사장님 3초만에 수수료 0원 혜택에 탑승하세요 !",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("주소가 복사되었습니다. 단톡방에 붙여넣어 주세요!");
      }
    } catch (err) {
      const isAbort = err instanceof Error && (err as Error).name === "AbortError";
      if (!isAbort) {
        console.error(err);
        alert("공유에 실패했습니다. 주소를 직접 복사해 주세요.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#191F28] font-sans antialiased tracking-[-0.05em]">
      {/* 토스 스타일의 투명 헤더 */}
      <header className="max-w-md mx-auto px-6 py-5 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-[#F2F4F6]">
        <h1 className="text-[22px] font-bold tracking-[-0.06em] text-[#191F28]">
          직결<span className="text-[#3182F6]">.</span>
        </h1>
        <button
          type="button"
          onClick={handleClose}
          className="text-[15px] font-semibold text-[#8B95A1] hover:text-[#4E5968] transition-colors px-2 py-1"
          aria-label="닫기"
        >
          ✕ 닫기
        </button>
      </header>

      <main className="max-w-md mx-auto px-6 pt-10 pb-24 space-y-12">
        {/* OUR STORY 섹션 */}
        <div className="space-y-4 text-center">
          <span className="inline-block bg-[#E8F4FF] text-[#3182F6] text-[13px] font-bold px-3 py-1 rounded-md">
            OUR STORY
          </span>
          <h2 className="text-[28px] sm:text-[32px] font-bold leading-[1.35] tracking-[-0.07em] break-keep">
            <span className="text-[#191F28] whitespace-nowrap">에이전시 배불리기는</span><br />
            <span className="text-[#3182F6] whitespace-nowrap">이제 끝났습니다.</span>
          </h2>
          <p className="text-[#4E5968] text-[15px] sm:text-[17px] leading-[1.6] font-medium break-keep">
            행사 한 번 뛸 때마다 가져가던 수수료.<br />
            고인물들끼리의 일거리 돌려먹기.<br />
            <span className="text-[#3182F6] font-bold">직결</span>은 모두에게 정당한 구조를 만들고 싶습니다.
          </p>
        </div>

        {/* 브랜드 철학 박스 (토스 특유의 입체감 없는 면 분할) */}
        <div className="bg-white p-7 rounded-[28px] border border-[#F2F4F6] space-y-5">
          <h3 className="text-[16px] sm:text-[18px] font-bold text-[#191F28] flex items-center gap-2 flex-wrap break-keep">
            <span>🔥</span>
            <span className="text-[#3182F6] text-[1.2em] font-bold leading-none align-middle mr-[-0.22em]">직결</span><span className="tracking-[-0.18em]">은</span> 현장에서 뛰어본 사람들이 만듭니다
          </h3>
          <p className="text-[14px] sm:text-[15px] text-[#4E5968] leading-[1.65] font-medium break-keep">
            행사 바닥에서 직접 매대를 펴고 현장을 뛰었습니다. 새벽부터 재료를 준비하고, 더위와 추위를 버티며 일한 수익의 일부를 전화 몇 통 돌린 에이전시가 가져가는 것을 보며 뼈저리게 느꼈습니다.
          </p>
          <strong className="block text-center text-[#3182F6] font-bold text-[15px] sm:text-[17px] break-keep">
            "땀 흘린 사장님이 온전히 돈을 버는 구조를 만들자."
          </strong>
          <p className="text-[14px] sm:text-[15px] text-[#4E5968] leading-[1.65] font-medium break-keep">
            이것이 직결의 철학입니다.
          </p>
        </div>

        {/* 입력 폼 섹션 */}
        <div className="pt-8 border-t border-[#F2F4F6]">
          {isSuccess ? (
            <div className="bg-white p-10 rounded-[32px] text-center border border-[#F2F4F6] animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-5xl mb-6">🎉</div>
              <h4 className="text-[24px] font-bold text-[#191F28] mb-3">탑승 완료!</h4>
              <p className="text-[#4E5968] text-[16px] mb-10 font-medium leading-relaxed">
                사장님의 정보가 안전하게 등록되었습니다.<br/>
                좋은 일거리가 생기면 가장 먼저 연락드릴게요!
              </p>
              <button 
                type="button"
                onClick={handleShare}
                className="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold py-[18px] rounded-[18px] active:scale-[0.97] transition-all text-[18px]"
                aria-label="주변 사장님께 링크 공유하기"
              >
                🤝 주변 사장님께 공유하기
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <h3 className="text-[20px] sm:text-[24px] font-bold text-center leading-tight break-keep">
                <span className="whitespace-nowrap">수수료 0원 행사 매칭,</span><br/>
                <span className="text-[#3182F6] whitespace-nowrap">지금 바로 탑승하세요 🚀</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-7">
                  {/* 상호명 */}
                  <div className="group">
                    <label htmlFor="business_name" className={STYLES.label}>상호명</label>
                    <input
                      id="business_name"
                      type="text" name="business_name" required value={formData.business_name} onChange={handleChange}
                      placeholder="예) 맛있는 닭꼬치"
                      autoComplete="organization"
                      className={STYLES.input}
                    />
                  </div>

                  {/* 업종 */}
                  <div className="group">
                    <label htmlFor="category" className={STYLES.label}>업종</label>
                    <div className="relative">
                      <select
                        id="category"
                        name="category" value={formData.category} onChange={handleChange}
                        className={STYLES.select}
                      >
                        <option value="푸드트럭">🚚 푸드트럭</option>
                        <option value="플리마켓 셀러">💎 플리마켓 셀러</option>
                        <option value="기타">✨ 기타</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B95A1]" aria-hidden="true">▼</div>
                    </div>
                  </div>

                  {/* 연락처 */}
                  <div className="group">
                    <label htmlFor="phone_number" className={STYLES.label}>연락처</label>
                    <input
                      id="phone_number"
                      type="tel" name="phone_number" required value={formData.phone_number} onChange={handleChange}
                      placeholder="010-0000-0000"
                      autoComplete="tel"
                      inputMode="numeric"
                      className={STYLES.input}
                    />
                  </div>

                  {/* 주 활동 지역 */}
                  <div className="group">
                    <label htmlFor="region" className={STYLES.label}>주 활동 지역</label>
                    <div className="relative">
                      <select
                        id="region"
                        name="region" value={formData.region} onChange={handleChange}
                        className={STYLES.select}
                      >
                        <option value="전국구(지역상관없음)">전국구(지역상관없음)</option>
                        <option value="서울">서울</option>
                        <option value="경기">경기</option>
                        <option value="인천">인천</option>
                        <option value="강원">강원</option>
                        <option value="충남">충남</option>
                        <option value="충북">충북</option>
                        <option value="경남">경남</option>
                        <option value="경북">경북</option>
                        <option value="전남">전남</option>
                        <option value="전북">전북</option>
                        <option value="제주">제주</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B95A1]" aria-hidden="true">▼</div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="w-full h-[64px] bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold text-[18px] rounded-[20px] mt-8 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "전송 중..." : "0원 혜택 탑승하기 🚀"}
                </button>
              </form>
            </div>
          )}
        </div>
        
        {/* 푸터 */}
        <p className="pt-10 text-center text-[#B0B8C1] text-[13px] font-semibold tracking-widest uppercase">
          © 2026 직결. All rights reserved.
        </p>
      </main>
    </div>
  );
}