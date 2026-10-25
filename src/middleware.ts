import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Izinkan asset statis, API internal, dan callback auth (OAuth SSO)
  if (
    path.startsWith('/_next') ||
    path.startsWith('/favicon.ico') ||
    path.startsWith('/api') ||
    path.startsWith('/auth') ||
    path.includes('.')
  ) {
    return response;
  }

  // Jika belum login
  if (!user) {
    if (path !== '/masuk') {
      const redirectUrl = new URL('/masuk', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Jika sudah login, ambil profile untuk cek status aktif dan peran
  const { data: profile } = await supabase
    .from('profiles')
    .select('peran, aktif')
    .eq('id', user.id)
    .single();

  // Jika akun dinonaktifkan (BR-01)
  if (profile && !profile.aktif) {
    await supabase.auth.signOut();
    const redirectUrl = new URL('/masuk?error=nonaktif', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Jika sudah login dan mencoba ke /masuk atau /, arahkan ke /dashboard
  if (path === '/masuk' || path === '/') {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Proteksi rute berbasis peran
  if (profile) {
    if ((path.startsWith('/laporan') || path.startsWith('/pengaturan')) && profile.peran !== 'hrd') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (path.startsWith('/persetujuan') && profile.peran === 'karyawan') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
