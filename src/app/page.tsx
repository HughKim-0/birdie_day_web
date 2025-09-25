// src/app/page.tsx (Server Component)
import { createClient } from "@/lib/supabaseServer";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import BannerCarousel from "@/components/BannerCarousel";
import StoreSearchBar from "@/components/StoreSearchBar";
import StoreCardModal from "@/components/StoreCardModal";

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
  picture?: { pic_name: string }[];
};

type Greeting = {
  seq: number;
  comment: string;
  start_time: string;
  end_time: string;
};

type UserRow = {
  user_pk: number;
  user_name: string | null;
  user_email: string | null;
  phone_no: string | null;
  is_owner: boolean | null;
  user_uuid: string | null; // uuid
  birth_day: string | null; // date
  reg_date: string | null;  // timestamptz
};

function getImageUrl(picName: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/app.picture/store_picture/${picName}`;
}

function isNowInRange(start: string, end: string, now: Date): boolean {
  const [sh, sm, ss] = start.split(":").map(Number);
  const [eh, em, es] = end.split(":").map(Number);

  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const nowMins = now.getHours() * 60 + now.getMinutes();

  if (startMins <= endMins) {
    // 같은 날 범위
    return nowMins >= startMins && nowMins < endMins;
  } else {
    //跨일 (예: 21:00 ~ 06:00)
    return nowMins >= startMins || nowMins < endMins;
  }
}

function getBannerUrl(fileName: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/app.picture/main_banner/${fileName}`;
}

export default async function Home() {
  const supabase = await createClient();

  const { data: files, error: listError } = await supabase.storage
    .from("app.picture")
    .list("main_banner");

  if (listError) {
    console.error("Storage list error:", listError);
  }

  const bannerUrls =
    files?.map((f) => getBannerUrl(f.name)).filter(Boolean) ?? [];

  // 1) 현재 로그인 유저 (auth)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2) 커스텀 user 테이블에서 내 정보 조회 (auth.users.id ↔ user.user_uuid)
  let me: UserRow | null = null;
  if (user) {
    const { data, error } = await supabase
      .from("user")
      .select(
        "user_pk, user_name, user_email, phone_no, is_owner, user_uuid, birth_day, reg_date"
      )
      .eq("user_uuid", user.id)
      .single<UserRow>();

    if (error) {
      console.error("public.user select error:", error);
    } else {
      me = data ?? null;
    }
  }


  const { data: greetings = [] } = await supabase
    .from("greeting")
    .select("seq, comment, start_time, end_time")
    .order("seq", { ascending: true });


  const now = new Date();
  let greetingComment: string | null = null;
  for (const g of (greetings ?? [])) {
    if (isNowInRange(g.start_time, g.end_time, now)) {
      greetingComment = g.comment;
      break;
    }
  }
  if (!greetingComment) greetingComment = "Welcome!"; // fallback

  // 3) 스토어 목록
  const { data: stores = [], error } = await supabase
    .from("store")
    .select(`
      store_pk, store_name, street, city, province, postal_code, country,
      phone_no, hourly_price, is_active, picture:picture(pic_name)
    `)
    .eq("is_active", true)
    .order("store_pk", { ascending: false })
    .limit(12);

  if (error) console.error("Supabase select error:", error);

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

  const displayName =
    me?.user_name ??
    user?.email?.split("@")[0] ??
    me?.user_email ??
    "Member";

  return (
    <div
      className="min-h-screen px-8 sm:px-20 font-sans"
      style={{ backgroundColor: "#8c9a79" }}
    >
      {/* 고정 헤더 */}
      <header className="w-full fixed top-0 left-0 bg-[#8c9a79] z-50">
        <div className="mx-auto max-w-7xl flex flex-row items-center justify-between px-8 py-6">
          {/* 로고 */}
          <svg
            viewBox="0 0 700 140"
            className="block h-12 w-auto"
            aria-label="Birdie Day"
          >
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

          {/* 메뉴 + 로그인/계정 */}
          <div className="flex items-center gap-6">
            <nav className="flex gap-6">
              <a
                className="text-white hover:underline underline-offset-4"
                href="#account"
              >
                Account
              </a>
              <a
                className="text-white hover:underline underline-offset-4"
                href="#search"
              >
                Search
              </a>
              <a
                className="text-white hover:underline underline-offset-4"
                href="#posts"
              >
                Posts
              </a>
              <a
                className="text-white hover:underline underline-offset-4"
                href="#chat"
              >
                Chat
              </a>
            </nav>
            <span className="text-white/50">|</span>


            {user ? (
              <div className="flex items-center gap-4">


                {/* 인사/이름 */}
                <span className="text-white">
                  {greetingComment} , <b>{displayName}</b> 님
                </span>



                {/* 로그아웃 (서버 액션) */}
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded bg-white/20 text-white hover:bg-white/30"
                  >
                    Log out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex gap-4">
                <a
                  href="/login"
                  className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
                >
                  Log in / Sign up
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="pt-25 mx-auto max-w-6xl">

        <BannerCarousel images={bannerUrls} />

        <div className="mt-3 mb-2">
          <StoreSearchBar />
        </div>

        <h1 className="text-2xl font-bold">Stores</h1>

        {(stores ?? []).length === 0 ? (
          <p className="opacity-80">표시할 매장이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(stores ?? []).map((s) => {
              const imgs = (s.picture ?? []).map((p) =>
                getImageUrl(p.pic_name)
              );
              // 주소 두 줄로
              const address1 = s.street ?? "";
              const address2 = [s.postal_code, s.province, s.country].filter(Boolean).join(", ");

              return (
                <li key={s.store_pk}>
                  <StoreCardModal
                    store_pk={s.store_pk}
                    store_name={s.store_name}
                    images={imgs}
                    address1={address1}
                    address2={address2}
                    hourly_price={s.hourly_price}
                    phone_no={s.phone_no}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

/* --- 서버 액션 --- */
export async function signOutAction() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut(); // 세션 쿠키 정리
  redirect("/");                 // 홈으로
}
