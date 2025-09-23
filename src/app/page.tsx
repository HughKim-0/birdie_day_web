// src/app/page.tsx  (Server Component)
import { createClient } from "@/lib/supabaseServer";

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
};

export default async function Home() {
  const supabase = await createClient();

  // 필요한 컬럼만 선택 (여기에는 cover_url 없음)
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
      is_active
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
    <div
      className="min-h-screen px-8 sm:px-20 font-sans"
      style={{ backgroundColor: "#8c9a79" }}
    >
      {/* 고정 헤더 */}
      <header className="w-full fixed top-0 left-0 bg-[#8c9a79] z-50">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6">
          {/* 로고 */}
          <svg viewBox="0 0 700 140" className="block h-12 w-auto" aria-label="Birdie Day">
            <text
              x="20"
              y="70"
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

          {/* 메뉴 */}
          <nav className="flex flex-wrap justify-center gap-4">
            <a className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800" href="#home">
              Home
            </a>
            <a className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800" href="#about">
              About
            </a>
            <a className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800" href="#reservations">
              Reservations
            </a>
            <a className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800" href="#contact">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* 본문 (헤더 높이만큼 패딩) */}
      <main className="pt-28 mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Stores</h1>

        {stores.length === 0 ? (
          <p className="opacity-80">표시할 매장이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((s) => (
              <li key={s.store_pk} className="rounded-xl bg-black/10 p-4 backdrop-blur-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">{s.store_name}</h3>
                  <span className="text-sm">{fmtPrice(s.hourly_price)}</span>
                </div>
                <p className="text-sm opacity-80">{fmtAddr(s)}</p>
                {s.phone_no && <p className="text-sm mt-1">☎ {s.phone_no}</p>}
                {/* 상세 페이지 연결은 /stores/[store_pk] 라우트 만들고 아래 링크 활성화 */}
                {/* <a href={`/stores/${s.store_pk}`} className="mt-3 inline-block rounded bg-black text-white px-3 py-1 hover:bg-gray-800">
                  자세히 보기
                </a> */}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
