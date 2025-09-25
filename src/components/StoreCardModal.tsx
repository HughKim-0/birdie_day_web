"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    store_pk: number;
    store_name: string;
    images: string[];           // 이미지 URL들
    address1: string;           // 예: "12 George St"
    address2: string;           // 예: "M2M 5G4, ON, CA"
    hourly_price: number | null;
    phone_no?: string | null;
};

export default function StoreCardModal({
    store_pk,
    store_name,
    images,
    address1,
    address2,
    hourly_price,
    phone_no,
}: Props) {
    const router = useRouter();
    const pics = images.length > 0 ? images : ["/no-image.png"];

    // 리스트에서 보이는 "카드" 클릭 → 모달 오픈
    const [open, setOpen] = useState(false);

    // 모달 안 이미지 슬라이더
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setIdx((p) => (p + 1) % pics.length), 3500);
        return () => clearInterval(t);
    }, [pics.length]);

    // ESC로 닫기
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

    return (
        <>
            {/* ▶ 리스트용 카드 (눌러서 모달 오픈) */}
            <button
                onClick={() => setOpen(true)}
                className="w-full text-left rounded-xl bg-black/10 p-4 backdrop-blur-sm hover:bg-black/15 transition"
            >
                <div className="relative w-full h-40 mb-3">
                    <Image src={pics[0]} alt={store_name} fill className="rounded-lg object-cover" />
                </div>
                <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold">{store_name}</h3>
                    <span className="text-sm">{priceText}/h</span>
                </div>
                <p className="text-sm opacity-80 truncate">{[address1, address2].filter(Boolean).join(", ")}</p>
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
                                    className={`object-cover transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"
                                        }`}
                                    priority={i === 0}
                                />
                            ))}
                            {/* dots */}
                            <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-2">
                                {pics.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2.5 h-2.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`}
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
                                onClick={() => router.push(`/app/book?store_pk=${store_pk}`)}
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
