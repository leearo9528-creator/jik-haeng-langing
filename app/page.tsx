"use client";

import { useState, useCallback, useRef } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const PHONE_REGEX = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/임시링크";

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

type UserType = "고객사" | "사장님";

const FORM_CONFIG: Record<
  UserType,
  {
    nameLabel: string;
    namePlaceholder: string;
    categoryLabel: string;
    categoryOptions: { value: string; label: string }[];
    phoneLabel: string;
    phonePlaceholder: string;
    regionLabel: string;
    regionOptions: { value: string; label: string }[];
  }
> = {
  고객사: {
    nameLabel: "기업/관공서/기관명",
    namePlaceholder: "예) (주)○○그룹, △△시청",
    categoryLabel: "필요한 서비스",
    categoryOptions: [
      { value: "푸드트럭 섭외", label: "푸드트럭 섭외" },
      { value: "케이터링", label: "케이터링" },
      { value: "플리마켓 셀러 모집", label: "플리마켓 셀러 모집" },
      { value: "기타", label: "기타" },
    ],
    phoneLabel: "담당자 연락처",
    phonePlaceholder: "010-0000-0000",
    regionLabel: "행사 예정 지역",
    regionOptions: [
      { value: "미정", label: "미정" },
      { value: "서울", label: "서울" },
      { value: "경기", label: "경기" },
      { value: "인천", label: "인천" },
      { value: "강원", label: "강원" },
      { value: "충남", label: "충남" },
      { value: "충북", label: "충북" },
      { value: "경남", label: "경남" },
      { value: "경북", label: "경북" },
      { value: "전남", label: "전남" },
      { value: "전북", label: "전북" },
      { value: "제주", label: "제주" },
    ],
  },
  사장님: {
    nameLabel: "상호명 및 대표자명",
    namePlaceholder: "예) 맛있는 닭꼬치 · 홍길동",
    categoryLabel: "제공 서비스",
    categoryOptions: [
      { value: "푸드트럭", label: "푸드트럭" },
      { value: "공방 출강", label: "공방 출강" },
      { value: "플리마켓 셀러", label: "플리마켓 셀러" },
      { value: "기타", label: "기타" },
    ],
    phoneLabel: "대표 연락처",
    phonePlaceholder: "010-0000-0000",
    regionLabel: "주 활동 지역",
    regionOptions: [
      { value: "전국구(지역상관없음)", label: "전국구(지역상관없음)" },
      { value: "서울", label: "서울" },
      { value: "경기", label: "경기" },
      { value: "인천", label: "인천" },
      { value: "강원", label: "강원" },
      { value: "충남", label: "충남" },
      { value: "충북", label: "충북" },
      { value: "경남", label: "경남" },
      { value: "경북", label: "경북" },
      { value: "전남", label: "전남" },
      { value: "전북", label: "전북" },
      { value: "제주", label: "제주" },
    ],
  },
};

const STYLES = {
  label: "block text-[14px] font-semibold text-[#8B95A1] mb-2 ml-1",
  input:
    "w-full min-h-[48px] h-[58px] px-5 rounded-[16px] bg-[#F2F4F6] border-none outline-none focus:bg-[#E8F4FF] focus:ring-2 focus:ring-[#3182F6]/20 transition-all font-semibold text-[16px] placeholder:text-[#B0B8C1] [font-size:16px]",
  select:
    "w-full min-h-[48px] h-[58px] px-5 rounded-[16px] bg-[#F2F4F6] border-none outline-none focus:bg-[#E8F4FF] transition-all font-semibold text-[16px] appearance-none cursor-pointer [font-size:16px]",
} as const;

export default function LandingPage() {
  const formSectionRef = useRef<HTMLDivElement>(null);
  const [userType, setUserType] = useState<UserType>("고객사");
  const defaultConfig = FORM_CONFIG["고객사"];
  const [formData, setFormData] = useState({
    business_name: "",
    category: defaultConfig.categoryOptions[0]?.value ?? "",
    phone_number: "",
    region: defaultConfig.regionOptions[0]?.value ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const config = FORM_CONFIG[userType];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const nextValue = name === "phone_number" ? formatPhoneNumber(value) : value;
      setFormData((prev) => ({ ...prev, [name]: nextValue }));
    },
    []
  );

  const handleUserTypeChange = useCallback((type: UserType) => {
    setUserType(type);
    const nextConfig = FORM_CONFIG[type];
    setFormData((prev) => ({
      ...prev,
      category: nextConfig.categoryOptions[0]?.value ?? "",
      region: nextConfig.regionOptions[0]?.value ?? "",
    }));
  }, []);

  const scrollToForm = useCallback(() => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
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
        const { error } = await supabase.from("sellers").insert([
          {
            ...formData,
            phone_number: phone,
            user_type: userType,
          },
        ]);
        if (error) {
          if (process.env.NODE_ENV === "development") console.error("Supabase insert error:", error);
          alert("앗, 일시적인 오류가 발생했습니다. 다시 시도해 주세요!");
        } else {
          setIsSuccess(true);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, userType]
  );

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const shareData = {
      title: "직결 - 수수료 0원 행사 매칭 플랫폼",
      url,
    };

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(url);
        alert("주소가 복사되었습니다. 단톡방에 붙여넣어 주세요!");
      } catch {
        alert("주소 복사에 실패했습니다. 주소를 직접 복사해 주세요.");
      }
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyToClipboard();
      }
    } catch (err) {
      const isAbort = err instanceof Error && (err as Error).name === "AbortError";
      if (isAbort) return;
      await copyToClipboard();
    }
  }, []);

  const categoryValue = formData.category || (config.categoryOptions[0]?.value ?? "");
  const regionValue = formData.region || (config.regionOptions[0]?.value ?? "");

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F9FAFB] text-[#191F28] font-sans antialiased tracking-[-0.05em]">
      <header className="max-w-md mx-auto px-4 sm:px-6 py-4 sm:py-5 flex justify-center items-center sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-[#F2F4F6]">
        <h1 className="text-[22px] font-bold tracking-[-0.06em] text-[#191F28]">
          직결<span className="text-[#3182F6]">.</span>
        </h1>
      </header>

      <main
        className="max-w-md mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-24 space-y-12 sm:space-y-14"
        style={{ paddingBottom: "max(6rem, env(safe-area-inset-bottom))" }}
      >
        {/* 히어로 섹션 */}
        <section className="space-y-5 text-center">
          <h2 className="text-[20px] min-[375px]:text-[22px] sm:text-[26px] font-bold leading-[1.5] tracking-[-0.06em] break-keep text-[#191F28]">
            <span className="text-[#3182F6]">불필요한 중간 마진</span>은 없애고,
            <br />
            <span className="text-[#3182F6]">전문성</span>은 높였습니다.
          </h2>
          <p className="text-[#4E5968] text-[14px] min-[375px]:text-[15px] sm:text-[16px] leading-[1.65] font-medium break-keep">
            수많은 검색과 전화,
            <br />
            비효율적인 대행구조는 이제 그만.
            <br />
            행사 담당자와 검증된 파트너를 잇는
            <br />
            가장 투명하고 빠른 다이렉트 매칭 플랫폼,
            <br />
            <span className="text-[#3182F6] font-bold text-[18px] min-[375px]:text-[20px] sm:text-[22px]">직결</span>.
          </p>
          <button
            type="button"
            onClick={scrollToForm}
            className="w-full max-w-[320px] mx-auto h-[56px] bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold text-[17px] rounded-[16px] shadow-sm active:scale-[0.98] transition-all"
            aria-label="폼 섹션으로 이동"
          >
            3초만에 무료 등록하기
          </button>
        </section>

        {/* 고충 공감 섹션 */}
        <section className="space-y-4">
          <h3 className="text-[17px] sm:text-[18px] font-bold text-[#191F28] text-center break-keep leading-[1.5]">
            행사 준비의 비효율, <span className="text-[#3182F6]">직결</span>이 해결합니다.
          </h3>

          <div className="space-y-4">
            {/* 박스 1: 행사 주최사/고객사 */}
            <div className="w-full rounded-[20px] p-6 sm:p-7 bg-[#F7F9FC] border border-[#E8ECF4] shadow-sm text-center">
              <p className="text-[13px] font-bold text-[#3182F6] mb-3 break-keep">
                🏢 주최사 및 행사 담당자의 고민
              </p>
              <p className="text-[15px] sm:text-[16px] text-[#191F28] font-medium leading-[1.65] break-keep whitespace-normal">
                행사 예산에 맞는 업체를 일일이 검색하고 견적을 비교하는 과정, 시간과 리소스 낭비가 크셨을 겁니다. 대행사에 온전히 맡기자니 소통의 지연과 아쉬운 결과물로 난감했던 경험, 이제는 끝내야 합니다. 직결에서는 단 한 번의 공고 등록으로 검증된 파트너들의 맞춤 견적을 직접 받아볼 수 있습니다.
              </p>
            </div>

            {/* 박스 2: 행사 파트너/사장님 */}
            <div className="w-full rounded-[20px] p-6 sm:p-7 bg-white border border-[#E8ECF4] shadow-sm text-center">
              <p className="text-[13px] font-bold text-[#3182F6] mb-3 break-keep">
                🧑‍🍳 케이터링 및 전문 파트너의 고민
              </p>
              <p className="text-[15px] sm:text-[16px] text-[#191F28] font-medium leading-[1.65] break-keep whitespace-normal">
                현장에서 땀 흘리며 최고의 서비스를 제공하는 것은 파트너님들입니다. 하지만 20~30%에 달하는 과도한 대행 수수료 구조 탓에, 노력한 만큼의 수익을 보장받기 어려우셨을 겁니다. 직결은 평생 수수료 0원입니다. 주최사와 직접 소통하며 온전한 비즈니스 성장을 경험하세요.
              </p>
            </div>
          </div>
        </section>

        {/* 해결책 & 액션 유도 + 폼 섹션 */}
        <div ref={formSectionRef} className="pt-2 scroll-mt-6 space-y-6">
          <section className="text-center space-y-2">
            <h3 className="text-[20px] sm:text-[22px] font-bold text-[#191F28] break-keep leading-[1.4]">
              수수료 0원, 빠르고 투명한 1:1 다이렉트 매칭 <span className="text-[#3182F6]">직결</span>.
            </h3>
            <p className="text-[#4E5968] text-[15px] sm:text-[16px] font-medium leading-[1.65] break-keep">
              가장 좋은 파트너와 행사 일정은 빠르게 마감됩니다. 지금 바로 사전등록하고 혜택을 선점하세요.
            </p>
          </section>
          {isSuccess ? (
            <div className="bg-white p-8 sm:p-10 rounded-[28px] text-center border border-[#F2F4F6] animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="text-5xl" aria-hidden>🎉</div>
              <h2 className="text-[22px] sm:text-[24px] font-bold text-[#191F28] leading-tight break-keep">
                사전등록이 완료되었어요 🎉
              </h2>
              <p className="text-[#4E5968] text-[15px] sm:text-[16px] font-medium leading-[1.6] break-keep">
                수수료 0원 혜택이 적용되었습니다.
                <br />
                런칭 즉시 1순위로 매칭 소식을 보내드릴게요.
              </p>
              <div className="space-y-3 pt-1">
                <a
                  href={KAKAO_OPEN_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#FEE500] hover:bg-[#FADA0A] text-[#191F28] font-bold py-4 px-4 rounded-[18px] active:scale-[0.97] transition-all text-[15px] sm:text-[16px] leading-tight break-keep text-center"
                  aria-label="실시간 행사 정보 카톡방 열기"
                >
                  💬 실시간 행사 정보, 카톡방에서 먼저 받기
                </a>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold py-4 px-4 rounded-[18px] active:scale-[0.97] transition-all text-[15px] sm:text-[16px] leading-tight break-keep"
                  aria-label="주변 사장님·담당자에게 공유하기"
                >
                  주변 사장님·담당자에게 공유하기
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 사용자 유형 선택 탭 (Segmented Control) */}
              <div className="relative p-1.5 rounded-[14px] bg-[#F2F4F6]">
                <div
                  className="absolute top-1.5 bottom-1.5 w-[calc(50%-3px)] rounded-[11px] bg-white shadow-sm transition-all duration-200 ease-out left-1.5"
                  style={{ transform: userType === "사장님" ? "translateX(100%)" : "translateX(0)" }}
                  aria-hidden
                />
                <div className="relative grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => handleUserTypeChange("고객사")}
                    className="relative z-10 py-3.5 px-4 rounded-[11px] text-[14px] font-bold transition-colors duration-200"
                    style={{
                      color: userType === "고객사" ? "#191F28" : "#8B95A1",
                    }}
                  >
                    나는 행사 주최자입니다<br />
                    <span className="text-[12px] font-semibold opacity-90">(고객사)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUserTypeChange("사장님")}
                    className="relative z-10 py-3.5 px-4 rounded-[11px] text-[14px] font-bold transition-colors duration-200"
                    style={{
                      color: userType === "사장님" ? "#191F28" : "#8B95A1",
                    }}
                  >
                    나는 행사 파트너입니다<br />
                    <span className="text-[12px] font-semibold opacity-90">(사장님)</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="business_name" className={STYLES.label}>
                      {config.nameLabel}
                    </label>
                    <input
                      id="business_name"
                      type="text"
                      name="business_name"
                      required
                      value={formData.business_name}
                      onChange={handleChange}
                      placeholder={config.namePlaceholder}
                      autoComplete="organization"
                      className={STYLES.input}
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className={STYLES.label}>
                      {config.categoryLabel}
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        name="category"
                        value={categoryValue}
                        onChange={handleChange}
                        className={STYLES.select}
                      >
                        {config.categoryOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div
                        className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B95A1]"
                        aria-hidden
                      >
                        ▼
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone_number" className={STYLES.label}>
                      {config.phoneLabel}
                    </label>
                    <input
                      id="phone_number"
                      type="tel"
                      name="phone_number"
                      required
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder={config.phonePlaceholder}
                      autoComplete="tel"
                      inputMode="numeric"
                      className={STYLES.input}
                    />
                  </div>

                  <div>
                    <label htmlFor="region" className={STYLES.label}>
                      {config.regionLabel}
                    </label>
                    <div className="relative">
                      <select
                        id="region"
                        name="region"
                        value={regionValue}
                        onChange={handleChange}
                        className={STYLES.select}
                      >
                        {config.regionOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div
                        className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B95A1]"
                        aria-hidden
                      >
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="w-full h-[64px] bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold text-[18px] rounded-[20px] mt-2 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "전송 중..." : "0원 혜택 탑승하기 🚀"}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="pt-6 text-center text-[#B0B8C1] text-[13px] font-semibold tracking-widest uppercase">
          © 2026 직결. All rights reserved.
        </p>
      </main>
    </div>
  );
}
