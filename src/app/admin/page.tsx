import Link from 'next/link';
import { getAuthSession } from '@/lib/auth';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, BarChart3, FileText, Users, ArrowRight, UserCheck, Shield, Camera, Settings } from 'lucide-react';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { News } from '@/lib/models/News';
import { Member } from '@/lib/models/Member';
import { getRecentAuditLogs } from '@/lib/audit';
import { AdminAnalyticsSection } from '@/components/admin/AdminAnalyticsSection';

export default async function AdminDashboardPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  const role = (session.user as any)?.role || 'user';

  if (role === 'user') {
    redirect('/admin/login?error=AccessDenied');
  }

  const isSuperAdmin = role === 'super_admin';

  let totalViews = 0;
  let totalMembers = 0;
  let totalNews = 0;
  let auditLogsCount = 0;

  try {
    await connectToDatabase();
    const [viewsRes, newsRes, membersRes, logsRes] = await Promise.allSettled([
      News.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      News.countDocuments(),
      Member.countDocuments(),
      getRecentAuditLogs(50),
    ]);

    if (viewsRes.status === 'fulfilled' && viewsRes.value && viewsRes.value.length > 0 && typeof viewsRes.value[0]?.total === 'number') {
      totalViews = viewsRes.value[0].total;
    }
    if (newsRes.status === 'fulfilled') {
      totalNews = newsRes.value;
    }
    if (membersRes.status === 'fulfilled') {
      totalMembers = membersRes.value;
    }
    if (logsRes.status === 'fulfilled' && logsRes.value) {
      auditLogsCount = logsRes.value.length;
    }
  } catch (e) {
    console.warn('Dashboard stats aggregate error:', (e as Error).message);
  }

  return (
    <div className="space-y-8 py-4">
      {/* Admin Header */}
      <div className="bg-amber-400 border-4 border-black rounded-3xl p-5 sm:p-6 md:p-8 shadow-[6px_6px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="yellow" className="bg-white text-slate-950 font-black text-xs whitespace-nowrap shrink-0">
              <ShieldCheck className="w-4 h-4 text-slate-950 shrink-0" /> AREA TERPROTEKSI
            </Badge>
            <Badge variant={isSuperAdmin ? 'purple' : 'green'} className="text-slate-950 font-black text-xs uppercase whitespace-nowrap shrink-0">
              {isSuperAdmin ? 'SUPER ADMIN' : 'REGULAR ADMIN'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
            Selamat Datang di Portal Admin
          </h1>
          <div className="flex items-center gap-2.5 pt-1 min-w-0 max-w-full">
            <img
              src={session.user.image || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + session.user.email}
              alt="Avatar"
              className="w-7 h-7 rounded-full border-2 border-black shrink-0"
            />
            <div className="text-xs sm:text-sm font-extrabold text-slate-950 flex flex-wrap items-center gap-x-1.5 min-w-0">
              <span>Akun:</span>
              <span className="font-mono underline font-black truncate max-w-[190px] xs:max-w-[260px] sm:max-w-xs md:max-w-md" title={session.user.email || ''}>
                {session.user.email}
              </span>
              <span className="hidden xs:inline">•</span>
              <span className="whitespace-nowrap">
                Hak Akses: <strong className="uppercase font-black">{role.replace('_', ' ')}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Link href="/admin/settings" className="flex-1 md:flex-none">
            <RetroButton variant="outline" size="md" className="w-full justify-center text-sm font-black whitespace-nowrap bg-white">
              <Settings className="w-5 h-5 text-slate-950 shrink-0" /> Pengaturan
            </RetroButton>
          </Link>
          {isSuperAdmin && (
            <Link href="/admin/users" className="flex-1 md:flex-none">
              <RetroButton variant="accent" size="md" className="w-full justify-center text-sm font-black whitespace-nowrap">
                <UserCheck className="w-5 h-5 text-slate-950 shrink-0" /> Kelola Admin
              </RetroButton>
            </Link>
          )}
        </div>
      </div>

      {/* Prominent Visual Analytics Section (Interactive SVG Charts & Metrics) */}
      <AdminAnalyticsSection
        totalViews={totalViews}
        totalMembers={totalMembers}
        totalNews={totalNews}
        auditLogsCount={auditLogsCount}
        role={role}
      />

      {/* Admin Navigation Hub Cards - Based on Role */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2">
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">
            Akses Cepat Manajemen Modul
          </h2>
          <Badge variant="yellow" className="whitespace-nowrap shrink-0">Navigasi Utama</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Stats & Audit (Super Admin Only / View) */}
          {isSuperAdmin ? (
            <RetroCard badgeBg="bg-purple-100" className="h-full flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-400 border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                  <BarChart3 className="w-6 h-6 text-slate-950" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-950">Statistik & Audit</h3>
                  <Badge variant="purple" className="text-[10px] shrink-0 whitespace-nowrap">Super Admin</Badge>
                </div>
                <p className="text-xs font-extrabold text-slate-950 leading-relaxed">
                  Pantau statistik tayangan real-time, admin terautentikasi, dan riwayat IP security logs dari koleksi MongoDB.
                </p>
              </div>
              <Link href="/admin/stats">
                <RetroButton variant="primary" size="sm" className="w-full justify-center">
                  Buka Audit & Stats <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
                </RetroButton>
              </Link>
            </RetroCard>
          ) : (
            <RetroCard badgeBg="bg-slate-100" animateHover={false} className="h-full flex flex-col justify-between space-y-4 opacity-90">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-300 border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                  <Shield className="w-6 h-6 text-slate-950" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950">Statistik & Audit</h3>
                <p className="text-xs font-extrabold text-slate-950 leading-relaxed">
                  Akses log audit sistem dan statistik keamanan IP khusus untuk peranan <strong className="text-purple-950 font-black">Super Admin</strong>.
                </p>
              </div>
              <Badge variant="dark" className="w-fit text-[10px] whitespace-nowrap shrink-0">Khusus Super Admin</Badge>
            </RetroCard>
          )}

          {/* Card 2: News Management (Super Admin & Admin) */}
          <RetroCard badgeBg="bg-amber-100" className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                <FileText className="w-6 h-6 text-slate-950" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950">Manajemen Berita</h3>
              <p className="text-xs font-extrabold text-slate-950 leading-relaxed">
                Tulis warta baru, atur galeri foto kegiatan, serta kelola publikasi berita organisasi.
              </p>
            </div>
            <Link href="/admin/berita">
              <RetroButton variant="secondary" size="sm" className="w-full justify-center">
                Kelola Berita <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
              </RetroButton>
            </Link>
          </RetroCard>

          {/* Card 3: Member Management (Super Admin & Admin) */}
          <RetroCard badgeBg="bg-cyan-100" className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400 border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                <Users className="w-6 h-6 text-slate-950" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950">Manajemen Anggota</h3>
              <p className="text-xs font-extrabold text-slate-950 leading-relaxed">
                Tambah, edit, dan atur susunan jajaran pengurus San Chapter Tasikmalaya berdasarkan divisi.
              </p>
            </div>
            <Link href="/admin/anggota">
              <RetroButton variant="accent" size="sm" className="w-full justify-center">
                Kelola Anggota <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
              </RetroButton>
            </Link>
          </RetroCard>

          {/* Card 4: Gallery Management (Super Admin & Admin) */}
          <RetroCard badgeBg="bg-rose-100" className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-400 border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                <Camera className="w-6 h-6 text-slate-950" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950">Manajemen Galeri</h3>
              <p className="text-xs font-extrabold text-slate-950 leading-relaxed">
                Atur dan unggah foto kegiatan yang ditampilkan secara otomatis pada slideshow landing page.
              </p>
            </div>
            <Link href="/admin/gallery">
              <RetroButton variant="primary" size="sm" className="w-full justify-center">
                Kelola Galeri <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
              </RetroButton>
            </Link>
          </RetroCard>
        </div>
      </div>
    </div>
  );
}
