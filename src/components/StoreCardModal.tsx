"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* Flutter Account.fromMap에 맞춰 직렬화할 UserRow 타입 */
type UserRow = {
  user_pk: number;
  user_name: string | null;
  user_email: string | null;
  phone_no: string | null;
  is_owner: boolean | null;
  user_uuid: string | null;
  birth_day: string | null;
  reg_date: string | null; // "YYYY-MM-DD" 또는 ISO 문자열
  reg_time?: string | null; // "HH:mm:ss" 또는 ISO 문자열(있으면 더 좋음)
};

type Props = {
  store_pk: number;
  store_name: string;
  images: string[]; // 이미지 URL들
  address1: string; // 예: "12 George St"
  address2: string; // 예: "M2M 5G4, ON, CA"
  hourly_price: number | null;
  phone_no?: string | null;
  me?: UserRow | null; // ✅ 추가: Next에서 내려주는 로그인 사용자
};

export default function StoreCardModal({
  store_pk,
  store_name,
  images,
  address1,
  address2,
  hourly_price,
  phone_no,
  me,
}: Props) {
  const router = useRouter();
  const pics = images.length > 0 ? images : ["/no-image.png"];

  const [open, setOpen] = useState(false);

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % pics.length), 3500);
    return () => clearInterval(t);
  }, [pics.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const priceText =
    hourly_price != null
      ? new Intl.NumberFormat("en-CA", {
          style: "currency",
          currency: "CAD",
          maximumFractionDigits: 0,
        }).format(hourly_price)
      : "—";

  // ❗ Flutter의 Account.fromMap이 DateTime.parse 가능한 값을 기대하므로
  // reg_time이 "HH:mm:ss"만 오면 날짜를 붙여 ISO 형태로 변환해 준다.
  function toAccountPayload(u: UserRow) {
    const REG_TIME_FALLBACK = "1970-01-01T00:00:00";
    const fixRegTime = (t: string | null | undefined) => {
      if (!t) return REG_TIME_FALLBACK;
      // "HH:mm:ss" 형태면 날짜를 붙여 ISO 유사 형태로
      if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return `1970-01-01T${t}`;
      return t; // 이미 ISO면 그대로
    };

    return {
      user_pk: u.user_pk ?? 0,
      user_name: u.user_name ?? "",
      user_email: u.user_email ?? "",
      reg_date: u.reg_date ?? new Date().toISOString(), // DateTime.parse 가능
      reg_time: fixRegTime(u.reg_time),
      phone_no: u.phone_no ?? "",
      is_owner: !!u.is_owner,
    };
  }

  function handleBookClick() {
    try {
      if (me) {
        const payload = toAccountPayload(me);
        localStorage.setItem("bd_user", JSON.stringify(payload));
      } else {
        localStorage.removeItem("bd_user");
      }
    } catch {
      // localStorage 접근 오류는 무시
    }
    // Flutter 해시 라우팅으로 이동 (서버 리라이트 영향 없음)
    router.push(`/flutter/#/book?store_pk=${store_pk}`);
  }

  return (
    <>
      {/* ▶ 리스트용 카드 (눌러서 모달 오픈) */}
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-xl bg-black/10 p-4 backdrop-blur-sm hover:bg-black/15 transition"
      >
        <div className="relative w-full h-40 mb-3">
          <Image
            src={pics[0]}
            alt={store_name}
            fill
            className="rounded-lg object-cover"
          />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold">{store_name}</h3>
          <span className="text-sm">{priceText}/h</span>
        </div>
        <p className="text-sm opacity-80 truncate">
          {[address1, address2].filter(Boolean).join(", ")}
        </p>
      </button>

      {/* ▶ 모달 */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#e6dfcf] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full bg-black/10 w-8 h-8 grid place-items-center hover:bg-black/20"
              aria-label="Close"
            >
              ✕
            </button>

            {/* 상단 핸들바 느낌 */}
            <div className="mt-3 flex justify-center">
              <div className="h-1.5 w-12 rounded-full bg-black/20" />
            </div>

            {/* 제목 + 즐겨찾기(로컬 토글) */}
            <div className="px-5 pt-3 pb-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{store_name}</h2>
              {/* 즐겨찾기는 우선 로컬 토글만 */}
              <FavHeart />
            </div>

            {/* 이미지 캐러셀 */}
            <div className="relative mx-4 h-48 sm:h-56 overflow-hidden rounded-xl">
              {pics.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt={`store-${i}`}
                  fill
                  className={`object-cover transition-opacity duration-700 ${
                    i === idx ? "opacity-100" : "opacity-0"
                  }`}
                  priority={i === 0}
                />
              ))}
              {/* dots */}
              <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-2">
                {pics.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i === idx ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 주소 / 가격 */}
            <div className="px-5 pt-4 text-center">
              {address1 && <p className="text-sm">{address1}</p>}
              {address2 && <p className="text-sm">{address2}</p>}
              {phone_no && <p className="text-sm mt-1">☎ {phone_no}</p>}
              <p className="text-sm mt-2">Regular Price: {priceText}</p>
            </div>

            {/* 오늘 요일/영업시간 영역(데모용 summary) */}
            <details className="px-5 mt-2 text-sm cursor-pointer">
              <summary className="list-none flex items-center justify-center gap-2 py-2 text-gray-800">
                <span>Today</span>
                <span className="opacity-70">(09:00 ~ 18:00)</span>
                <span className="ml-1">▾</span>
              </summary>
              {/* 필요 시 실제 영업시간 테이블로 교체 */}
              <div className="pb-2 text-gray-700">요일별 영업시간 넣을 자리</div>
            </details>

            {/* Book 버튼 */}
            <div className="px-5 pb-5 pt-3">
              <button
                onClick={handleBookClick}
                className="w-full rounded-xl bg-black text-white py-3"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FavHeart() {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className="text-2xl leading-none select-none"
      aria-label="Favorite"
      title="Favorite"
    >
      {on ? "❤️" : "🤍"}
    </button>
  );
}
