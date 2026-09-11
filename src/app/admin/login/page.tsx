'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { RetroButton } from '@/components/ui/RetroButton';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

function AdminLoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get('callbackUrl');

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userRole = (session.user as any)?.role || 'user';

      // If explicit custom destination (like /admin/gallery or /berita), honor it
      if (
        rawCallback &&
        !rawCallback.includes('/login') &&
        !rawCallback.includes('/admin/login') &&
        rawCallback !== '/'
      ) {
        router.push(rawCallback);
        return;
      }

      // Role-Based Post-Login Routing
      if (userRole === 'super_admin' || userRole === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [session, status, router, rawCallback]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: rawCallback || '/login' });
  };

  return (
    <div className="max-w-5xl mx-auto my-4 md:my-8 rounded-3xl border-4 border-black bg-white shadow-[10px_10px_0px_0px_#000] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
      {/* Left Column: Focused Clean Auth Form (6 cols) */}
      <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between space-y-8 bg-white">
        {/* Header Branding */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-black flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_#000]">
              <img
                src="/logo.png"
                alt="San Chapter Tasikmalaya Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <span className="font-black text-sm text-slate-950 tracking-tight group-hover:text-amber-600 transition-colors">
              SAN CHAPTER TASIKMALAYA
            </span>
          </Link>
          <Badge variant="yellow" className="text-slate-950 font-black text-[10px]">
            PORTAL MASUK
          </Badge>
        </div>

        {/* Main Sign In Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              Masuk dengan akun Google resmi untuk mengabdi dan mengakses fitur platform San Chapter Tasikmalaya.
            </p>
          </div>

          {/* Google OAuth Button */}
          <div className="pt-2">
            <RetroButton
              variant="accent"
              size="lg"
              className="w-full py-4 text-base font-black border-3 shadow-[5px_5px_0px_0px_#000]"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Masuk dengan Google
            </RetroButton>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
          <Link href="/" className="hover:text-amber-600 flex items-center gap-1 font-black">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda Utama
          </Link>
          <span className="text-[11px] text-slate-500 font-semibold">Protected Auth Portal</span>
        </div>
      </div>

      {/* Right Column: Clean Real Photo Background Panel (6 cols) */}
      <div className="lg:col-span-6 border-t-4 lg:border-t-0 lg:border-l-4 border-black relative min-h-[380px] lg:min-h-full overflow-hidden bg-slate-900 flex flex-col justify-end p-8 md:p-10">
        {/* Real Activity Image Background */}
        <img
          src="/images/_MG_2422.jpg"
          alt="San Chapter Tasikmalaya Activity"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Subtle Dark Gradient Overlay for optimal contrast & warmth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        {/* Clean Slogan Overlay */}
        <div className="relative z-10 space-y-3">
          <Badge variant="yellow" className="bg-amber-400 text-slate-950 font-black border-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-950 inline" /> KEGIATAN & KEBERSAMAAN
          </Badge>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
            Senyum Anak Nusantara Chapter Tasikmalaya
          </h2>
          <p className="text-xs md:text-sm font-semibold text-slate-200 leading-relaxed">
            Dokumentasi kebersamaan dan aksi nyata pengurus dalam mengabdi untuk kemajuan masyarakat Tasikmalaya.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-20 text-center font-bold text-slate-800">
          Memuat portal otentikasi...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
