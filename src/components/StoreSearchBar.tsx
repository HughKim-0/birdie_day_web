"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabaseBrowser";

type StoreLite = {
    store_pk: number;
    store_name: string;
    street: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
};

export default function StoreSearchBar() {
    const sb = createSupabaseBrowser();
    const router = useRouter();

    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<StoreLite[]>([]);
    const [highlight, setHighlight] = useState(0);
    const wrapRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // 바깥 클릭 닫기
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    // 입력 디바운스 검색
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!q.trim()) {
            setResults([]);
            setOpen(false);
            return;
        }
        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            const term = q.trim();

            const { data, error } = await sb
                .from("store")
                .select("store_pk, store_name, street, city, province, postal_code")
                .eq("is_active", true)
                .or(
                    `store_name.ilike.%${term}%,street.ilike.%${term}%,city.ilike.%${term}%,province.ilike.%${term}%,postal_code.ilike.%${term}%`
                )
                .order("store_pk", { ascending: false })
                .limit(5);

            if (error) {
                console.error("store search error:", error);
                setResults([]);
            } else {
                setResults((data ?? []) as StoreLite[]);
                setHighlight(0);
                setOpen(true);
            }
            setLoading(false);
        }, 250);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    function addr(s: StoreLite) {
        return [s.street, s.city, s.province, s.postal_code].filter(Boolean).join(", ");
    }

    function pick(s: StoreLite) {
        setOpen(false);
        setQ(s.store_name);
        router.push(`/store/${s.store_pk}`); // 상세 페이지 라우트에 맞게 유지/수정
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!open || results.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault(); setHighlight((h) => (h + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault(); setHighlight((h) => (h - 1 + results.length) % results.length);
        } else if (e.key === "Enter") {
            e.preventDefault(); pick(results[highlight]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }

    return (
        <div className="relative w-full" ref={wrapRef}>
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => q.trim() && setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder="가게 이름이나 주소로 검색..."
                className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 outline-none shadow-sm focus:border-black/40"
            />

            {open && (
                <div className="absolute z-50 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-black/10 bg-white shadow-lg">
                    {loading ? (
                        <div className="px-4 py-3 text-sm text-gray-500">검색 중…</div>
                    ) : results.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">결과가 없습니더.</div>
                    ) : (
                        <ul className="py-2">
                            {results.map((s, i) => (
                                <li
                                    key={s.store_pk}
                                    onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                                    onMouseEnter={() => setHighlight(i)}
                                    className={`cursor-pointer px-4 py-2 ${i === highlight ? "bg-black/5" : ""}`}
                                >
                                    <div className="text-sm font-medium">{s.store_name}</div>
                                    <div className="text-xs text-gray-500 truncate">{addr(s)}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
