// src/app/page.tsx  (Server Component)
import { createClient } from "@/lib/supabaseServer";
import Image from "next/image";

type Store = {
  store_pk: number;
  store_name: string;
  street: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string | null;
  phone_no: string | null;
  hourly_price: number | null;
  is_active: boolean;
  // 👇 조인으로 가져오는 대표사진(들)
  picture?: { pic_name: string }[]; 
};

function getImageUrl(picName: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/app.picture/store_picture/${picName}`;
}

export default async function Home() {
  const supabase = await createClient();

  const { data: stores = [], error } = await supabase
    .from("store")
    .select(`
      store_pk,
      store_name,
      street,
      city,
      province,
      postal_code,
      country,
      phone_no,
      hourly_price,
      is_active,
      picture:picture(pic_name)
    `)
    .eq("is_active", true)
    .order("store_pk", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Supabase select error:", error);
  }

  const fmtAddr = (s: Store) =>
    [s.street, s.city, s.province, s.postal_code].filter(Boolean).join(", ");

  const fmtPrice = (p: number | null) =>
    p != null
      ? new Intl.NumberFormat("en-CA", {
          style: "currency",
          currency: "CAD",
          maximumFractionDigits: 0,
        }).format(p) + "/h"
      : "—";

  return (
    <div className="min-h-screen px-8 sm:px-20 font-sans" style={{ backgroundColor: "#8c9a79" }}>
      {/* 고정 헤더 */}
    <header className="w-full fixed top-0 left-0 bg-[#8c9a79] z-50">
  <div className="mx-auto max-w-7xl flex flex-row items-center justify-between px-8 py-6">
    {/* 로고 */}
    <svg viewBox="0 0 700 140" className="block h-12 w-auto" aria-label="Birdie Day">
      <text
        x="20" y="70"
        fontFamily="Anton, Impact, Arial Black, sans-serif"
        fontSize="140"
        fontStyle="italic"
        fill="#e6dfcf"
        stroke="#000"
        strokeWidth="10"
        paintOrder="stroke fill"
        dominantBaseline="middle"
      >
        Birdie Day
      </text>
    </svg>

    {/* 메뉴 + 로그인 */}
    <div className="flex items-center gap-6">
      {/* 메뉴 */}
      <nav className="flex gap-6">
        <a className="text-white hover:underline underline-offset-4" href="#account">Account</a>
        <a className="text-white hover:underline underline-offset-4" href="#search">Search</a>
        <a className="text-white hover:underline underline-offset-4" href="#posts">Posts</a>
        <a className="text-white hover:underline underline-offset-4" href="#chat">Chat</a>
      </nav>

      {/* 구분선 */}
      <span className="text-white/50">|</span>

      {/* 로그인 버튼들 */}
      <div className="flex gap-4">
        <a href="/login" className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800">
  Log in / Sign up
</a>
      </div>
    </div>
  </div>
</header>

      {/* 본문 (헤더 높이만큼 패딩) */}
      <main className="pt-28 mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Stores</h1>

        {(stores ?? []).length === 0 ? (
          <p className="opacity-80">표시할 매장이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(stores ?? []).map((s) => {
              const picName = s.picture?.[0]?.pic_name;
              const imgUrl = picName ? getImageUrl(picName) : "/no-image.png"; // 기본 이미지 준비 권장

              return (
                <li key={s.store_pk} className="rounded-xl bg-black/10 p-4 backdrop-blur-sm">
                  <div className="relative w-full h-40 mb-3">
                    <Image
                      src={imgUrl}
                      alt={s.store_name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold">{s.store_name}</h3>
                    <span className="text-sm">{fmtPrice(s.hourly_price)}</span>
                  </div>
                  <p className="text-sm opacity-80">{fmtAddr(s)}</p>
                  {s.phone_no && <p className="text-sm mt-1">☎ {s.phone_no}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
