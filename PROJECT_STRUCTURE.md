# 직결(Jik-gyeol) 랜딩 — 프로젝트 구조 문서

> 수수료 0원 행사 매칭 플랫폼의 랜딩 페이지. 한 번에 전체 구조를 파악할 수 있도록 정리한 문서입니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **이름** | 직결 (jik-gyeol-landing) |
| **목적** | 행사 사장님 사전등록 수집 랜딩 페이지 |
| **주요 기능** | 브랜드 소개, 사장님 정보 폼 제출, 공유하기 |
| **배포** | Vercel (예: jik-haeng-langing.vercel.app) |

---

## 2. 폴더·파일 구성

```
jik-gyeol-landing/
├── app/
│   ├── layout.tsx      # 루트 레이아웃 (메타, 폰트, viewport)
│   ├── page.tsx        # 메인 랜딩 페이지 (유일한 화면)
│   └── globals.css     # 전역 스타일 + 모바일 터치/한글 최적화
├── public/             # 정적 파일 (favicon, svg 등)
├── next.config.ts      # Next.js 설정
├── postcss.config.mjs  # PostCSS (Tailwind)
├── tsconfig.json       # TypeScript 설정
├── eslint.config.mjs   # ESLint 설정
├── package.json        # 의존성·스크립트
└── .env.local          # 환경 변수 (Supabase, 로컬 전용, Git 제외)
```

- **실제 화면은 `app/page.tsx` 하나**이며, `layout.tsx`가 전체를 감싸고 `globals.css`를 불러옵니다.

---

## 3. 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| 백엔드/DB | Supabase (테이블: `sellers`) |
| 언어 | TypeScript |

---

## 4. 파일별 역할·코드 요약

### 4.1 `app/layout.tsx`

- **역할**: 모든 페이지에 공통 적용되는 루트 레이아웃.
- **주요 내용**:
  - **Viewport**: `viewportFit: "cover"`, `maximumScale: 5` → 노치·풀스크린 대응.
  - **Metadata**: title, themeColor(`#3182F6`), Open Graph, Twitter 카드 (description은 비움).
  - **폰트**: Geist Sans만 사용 (CSS 변수 `--font-geist-sans`).
  - **구조**: `<html lang="ko">` → `<body>` → `{children}`.

---

### 4.2 `app/page.tsx`

- **역할**: 메인 랜딩 페이지 전체 (클라이언트 컴포넌트, `"use client"`).

**상단(모듈 레벨)**  
- Supabase 클라이언트: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`로 한 번 생성.  
- `PHONE_REGEX`, `formatPhoneNumber()`: 연락처 검증·자동 하이픈 포맷.  
- `STYLES`: 폼 라벨·input·select·본문용 Tailwind 클래스 묶음.

**상태**  
- `formData`: 상호명, 업종, 연락처, 주 활동 지역.  
- `isSubmitting`, `isSuccess`: 제출 중/성공 여부.

**핸들러**  
- `handleChange`: 입력값 반영, 연락처는 `formatPhoneNumber` 적용.  
- `handleSubmit`: 연락처 정규식 검사 → Supabase `sellers` 테이블에 insert → 성공 시 `isSuccess = true`.  
- `handleShare`: `navigator.share` 시도, 실패 시 클립보드 복사 후 안내.

**UI 구조 (위→아래)**  
1. **헤더**: 로고 "직결." (sticky).  
2. **OUR STORY**: 뱃지 + "에이전시 배불리기는 이제 끝났습니다" + 소개 문단.  
3. **브랜드 철학 박스**: "직결은 현장에서 뛰어본 사람들이 만듭니다" + 인용문 + 마무리 문장 (가운데 정렬).  
4. **폼 섹션**:  
   - 성공 시: "탑승 완료!" + 공유하기 버튼.  
   - 미제출 시: 상호명·업종·연락처·지역 입력 폼 + "0원 혜택 탑승하기" 버튼.  
5. **푸터**: © 2026 직결.

**모바일 대응**  
- `min-h-[100dvh]`, 하단 `paddingBottom: max(6rem, env(safe-area-inset-bottom))`, input `min-h-[48px]`·`font-size: 16px`(iOS 줌 방지).

---

### 4.3 `app/globals.css`

- **역할**: 전역 스타일 + Tailwind 진입점 + 모바일/한글 보조.
- **주요 내용**:
  - `@import "tailwindcss"`, `@theme inline`: 배경/전경 색, `--font-sans`(Geist).
  - `html`: `-webkit-text-size-adjust: 100%`, `overflow-x: hidden`.
  - `body`: safe-area 하단 패딩, `overflow-x: hidden`.
  - 버튼·a·input·select·textarea: `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`.
  - `.break-keep`: `word-break: keep-all` (한글 줄바꿈).

---

### 4.4 설정 파일 요약

| 파일 | 역할 |
|------|------|
| `next.config.ts` | Next.js 기본 설정 (추가 옵션 없음). |
| `postcss.config.mjs` | `@tailwindcss/postcss` 플러그인 사용. |
| `tsconfig.json` | `target: ES2017`, `paths: { "@/*": ["./*"] }` 등. |
| `eslint.config.mjs` | Next 권장 ESLint + TypeScript. |
| `package.json` | next, react, @supabase/supabase-js, tailwindcss 등. |

---

## 5. 데이터 흐름

```
[사용자 입력] → formData (React state)
       ↓
[제출 클릭] → handleSubmit
       ↓
연락처 검증 (PHONE_REGEX) → Supabase insert("sellers", { business_name, category, phone_number, region })
       ↓
성공 시 isSuccess = true → "탑승 완료!" + 공유하기 UI
```

- **Supabase 테이블**: `sellers`  
- **필드**: `business_name`, `category`, `phone_number`, `region` (환경 변수 없으면 insert 전에 alert 후 중단).

---

## 6. 환경 변수

`.env.local` (로컬·배포 시 설정):

| 변수명 | 용도 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon(공개) Key |

---

## 7. 한눈에 보는 구조도

```
layout.tsx (메타, viewport, Geist 폰트)
    └── globals.css (전역·모바일 스타일)
    └── page.tsx (랜딩 전부)
            ├── 헤더 (로고)
            ├── OUR STORY
            ├── 브랜드 철학
            ├── 폼 or 탑승 완료 + 공유
            └── 푸터
                    ↓
            Supabase "sellers" 테이블
```

이 문서만 보면 **파일 구성**, **각 파일이 하는 일**, **데이터가 어떻게 흐르는지**를 한 번에 파악할 수 있습니다.
