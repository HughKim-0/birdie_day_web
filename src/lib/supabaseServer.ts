import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
    // ⬇️ await 추가
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set() { }, // 서버에서는 보통 no-op
                remove() { },
            },
        }
    );
}
