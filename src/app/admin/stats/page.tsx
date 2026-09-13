'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { Badge } from '@/components/ui/Badge';
import { getAdminRealtimeStats } from '@/app/actions/statsActions';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  Eye,
  ShieldAlert,
  RotateCw,
  Globe,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Shield,
  UserCheck,
} from 'lucide-react';

export default function AdminStatsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const data = await getAdminRealtimeStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 py-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin">
            <span className="text-xs font-black text-slate-800 hover:text-amber-600 flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Panel Statistik & Audit Log Real-Time
            </h1>
            <Badge variant="green" className="bg-emerald-300 text-slate-950 font-black">
              LIVE
            </Badge>
          </div>
          {/* Prominently show current authenticated Google account */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <div className="flex items-center gap-2 bg-amber-100 border-2 border-black rounded-xl px-3 py-1.5 text-xs font-black text-slate-950 shadow-[2px_2px_0px_0px_#000]">
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Akun Login:</span>
              <span className="font-mono text-cyan-950 underline">{session?.user?.email || 'Memuat email...'}</span>
              <Badge variant="purple" className="text-[10px] py-0.5 px-2 uppercase font-black">
                {(session?.user as any)?.role?.replace('_', ' ') || 'SUPER ADMIN'}
              </Badge>
            </div>
          </div>
        </div>

        <RetroButton
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={refreshing}
          className="bg-white"
        >
          <RotateCw className={`w-4 h-4 text-slate-950 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Data
        </RetroButton>
      </div>

      {loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-black rounded-full animate-spin mx-auto" />
          <p className="font-extrabold text-slate-800 text-sm">Mengambil log MongoDB & statistik real-time...</p>
        </div>
      ) : (
        <>
          {/* Key Metric Stat Cards - Crisp High Contrast Styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <RetroCard badgeBg="bg-amber-300 text-slate-950" animateHover={false} className="space-y-2">
              <div className="flex items-center justify-between text-slate-950">
                <span className="text-xs font-black uppercase tracking-wider text-slate-950">Total Views & Views</span>
                <Eye className="w-5 h-5 text-slate-950" />
              </div>
              <p className="text-3xl font-black text-slate-950">{stats?.totalViews.toLocaleString('id-ID')}</p>
              <p className="text-[11px] font-black text-slate-950">Akumulasi tayangan artikel & halaman</p>
            </RetroCard>

            <RetroCard badgeBg="bg-cyan-300 text-slate-950" animateHover={false} className="space-y-2">
              <div className="flex items-center justify-between text-slate-950">
                <span className="text-xs font-black uppercase tracking-wider text-slate-950">IP Pengakses Unik</span>
                <Globe className="w-5 h-5 text-slate-950" />
              </div>
              <p className="text-3xl font-black text-slate-950">{stats?.uniqueIPsCount}</p>
              <p className="text-[11px] font-black text-slate-950">Unique IP address dari audit_logs</p>
            </RetroCard>

            <RetroCard badgeBg="bg-emerald-300 text-slate-950" animateHover={false} className="space-y-2">
              <div className="flex items-center justify-between text-slate-950">
                <span className="text-xs font-black uppercase tracking-wider text-slate-950">Admin Terautentikasi</span>
                <Users className="w-5 h-5 text-slate-950" />
              </div>
              <p className="text-3xl font-black text-slate-950">{stats?.activeAdmins.length}</p>
              <p className="text-[11px] font-black text-slate-950">Pengurus terverifikasi (Super Admin & Admin)</p>
            </RetroCard>

            <RetroCard badgeBg="bg-rose-300 text-slate-950" animateHover={false} className="space-y-2">
              <div className="flex items-center justify-between text-slate-950">
                <span className="text-xs font-black uppercase tracking-wider text-slate-950">Total Audit Log</span>
                <ShieldAlert className="w-5 h-5 text-slate-950" />
              </div>
              <p className="text-3xl font-black text-slate-950">{stats?.recentAuditLogs.length}</p>
              <p className="text-[11px] font-black text-slate-950">Catatan aktivitas & percobaan login</p>
            </RetroCard>
          </div>

          {/* Active Admin Emails & IP Section */}
          <RetroCard badgeBg="bg-white" className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-black text-slate-950">Daftar Admin Logged-In & Peran RBAC</h3>
              </div>
              <Badge variant="green" className="text-slate-950 font-black">
                MongoDB User Collection
              </Badge>
            </div>

            {stats?.activeAdmins?.length === 0 ? (
              <div className="p-6 text-center text-xs font-bold text-slate-700 bg-amber-50/50 rounded-2xl border-2 border-dashed border-slate-300">
                Belum ada data admin terverifikasi tercatat di database.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats?.activeAdmins.map((admin: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-amber-50 border-2 border-black space-y-1.5 shadow-[2px_2px_0px_0px_#000]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-950 text-sm">{admin.name}</span>
                      <Badge variant={admin.role === 'super_admin' ? 'purple' : 'yellow'} className="text-[10px] text-slate-950 font-black">
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </div>
                    <p className="text-xs font-black text-slate-800">{admin.email}</p>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pt-1 border-t border-amber-200">
                      <span className="flex items-center gap-1 font-mono text-slate-950 font-bold">
                        <Globe className="w-3 h-3 text-cyan-800" /> IP: {admin.lastIp}
                      </span>
                      <span className="flex items-center gap-1 text-slate-800 font-bold">
                        <Clock className="w-3 h-3 text-amber-700" />
                        {new Date(admin.lastLogin).toLocaleTimeString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </RetroCard>

          {/* Recent Security IP Audit Log Table (Koleksi audit_logs) */}
          <RetroCard badgeBg="bg-white" className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-xl font-black text-slate-950">
                  Audit Logs & IP Security Tracking
                </h3>
                <p className="text-xs font-bold text-slate-800">
                  Data langsung dari MongoDB koleksi <code className="font-mono bg-slate-100 px-1.5 py-0.5 border border-black rounded text-slate-950 font-black">audit_logs</code>
                </p>
              </div>
              <Badge variant="purple" className="text-slate-950 font-black">
                MongoDB Collection
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-amber-300 font-black border-2 border-black uppercase tracking-wider">
                    <th className="p-3 border border-slate-700">Waktu</th>
                    <th className="p-3 border border-slate-700">Email Pengurus</th>
                    <th className="p-3 border border-slate-700">IP Address</th>
                    <th className="p-3 border border-slate-700">Aksi / Event</th>
                    <th className="p-3 border border-slate-700">User Agent & Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-2 border-black font-bold text-slate-950">
                  {stats?.recentAuditLogs?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs font-bold text-slate-600">
                        Belum ada catatan aktivitas di koleksi <code className="font-mono bg-slate-100 px-1 py-0.5 border border-slate-300 rounded">audit_logs</code> MongoDB.
                      </td>
                    </tr>
                  ) : (
                    stats?.recentAuditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-amber-50 transition-colors">
                        <td className="p-3 border font-mono text-slate-950 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 border font-black text-slate-950">{log.email}</td>
                        <td className="p-3 border font-mono font-black text-cyan-900">
                          {log.ipAddress}
                        </td>
                        <td className="p-3 border">
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase ${
                              log.action.includes('SUCCESS') || log.action.includes('CREATE')
                                ? 'bg-emerald-200 text-slate-950 border-black'
                                : log.action.includes('REJECTED') || log.action.includes('FAILED')
                                ? 'bg-rose-200 text-slate-950 border-black'
                                : 'bg-amber-200 text-slate-950 border-black'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 border max-w-xs truncate text-[11px] text-slate-800">
                          <div className="font-bold text-slate-950">{log.details}</div>
                          <div className="text-[10px] text-slate-700 font-mono truncate">
                            {log.userAgent}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </RetroCard>
        </>
      )}
    </div>
  );
}
