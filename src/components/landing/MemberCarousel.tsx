'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getMembersList } from '@/app/actions/memberActions';
import { Badge } from '@/components/ui/Badge';
import { RetroButton } from '@/components/ui/RetroButton';
import { Users, ArrowRight, MessageCircle, Crown, RotateCw, AlertTriangle } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/SocialIcons';

interface MemberCardProps {
  member: any;
  isClone?: boolean;
}

function MemberCard({ member, isClone }: MemberCardProps) {
  const isLeader =
    member.role?.toLowerCase().includes('ketua') ||
    member.division?.toLowerCase().includes('ketua');

  return (
    <div className="w-64 sm:w-72 shrink-0 bg-white border-3 border-black rounded-3xl p-4 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_#000] transition-all flex flex-col justify-between group select-none">
      <div className="space-y-3">
        {/* Photo Container */}
        <div className="relative h-56 sm:h-64 w-full rounded-2xl border-2 border-black overflow-hidden bg-amber-100 shadow-[2px_2px_0px_0px_#000]">
          <img
            src={member.photoUrl || '/images/san-activity.jpg'}
            alt={member.name}
            onError={(e) => {
              e.currentTarget.src = '/images/san-activity.jpg';
            }}
            className={`w-full h-full object-cover ${member.imagePosition || 'object-center'} group-hover:scale-105 transition-transform duration-300`}
            loading="lazy"
          />

          {/* Top Division Badge */}
          <div className="absolute top-2.5 left-2.5">
            <Badge
              variant={isLeader ? 'yellow' : 'blue'}
              className="text-black font-black text-[10px] sm:text-xs shadow-[2px_2px_0px_0px_#000]"
            >
              {isLeader ? <Crown className="w-3 h-3 text-black inline mr-1" /> : null}
              {member.division}
            </Badge>
          </div>

          {/* Bottom Role Overlay */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5">
            <div className="bg-white/95 backdrop-blur-sm border-2 border-black px-2.5 py-1 rounded-xl shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[11px] font-black text-slate-950 uppercase tracking-wide truncate block">
                {member.role}
              </span>
            </div>
          </div>
        </div>

        {/* Name & Bio */}
        <div className="space-y-1">
          <h3 style={{ color: '#000000' }} className="font-black text-black text-base sm:text-lg leading-snug truncate">
            {member.name}
          </h3>
          <p style={{ color: '#020617' }} className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">
            {member.bio || `Pengurus ${member.division} San Chapter Tasikmalaya`}
          </p>
        </div>
      </div>

      {/* Footer Social & Link */}
      <div className="pt-3 border-t-2 border-slate-200 mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {member.instagram && (
            <a
              href={`https://instagram.com/${member.instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              tabIndex={isClone ? -1 : 0}
              title="Buka Instagram"
              className="w-7 h-7 rounded-lg bg-rose-100 border border-black flex items-center justify-center text-rose-700 hover:bg-rose-300 transition-colors shadow-[1px_1px_0px_0px_#000]"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
          )}
          {member.whatsapp && (
            <a
              href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              tabIndex={isClone ? -1 : 0}
              title="Chat WhatsApp"
              className="w-7 h-7 rounded-lg bg-emerald-100 border border-black flex items-center justify-center text-emerald-800 hover:bg-emerald-300 transition-colors shadow-[1px_1px_0px_0px_#000]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <Link href="/anggota" tabIndex={isClone ? -1 : 0}>
          <span className="text-[11px] font-black text-amber-700 hover:text-black transition-colors flex items-center gap-0.5 cursor-pointer">
            Detail Profil <ArrowRight className="w-3 h-3 inline" />
          </span>
        </Link>
      </div>
    </div>
  );
}

export function MemberCarousel() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = () => {
    setLoading(true);
    setError(null);
    getMembersList('Semua')
      .then((data) => {
        if (data && Array.isArray(data)) {
          setMembers(data);
        } else {
          setMembers([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load members for carousel:', err);
        setError('Gagal memuat data pengurus dari database.');
        setMembers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Guarantee enough cards to span wide viewports for seamless loop
  const displayMembers = useMemo(() => {
    if (!members || members.length === 0) return [];
    let list = [...members];
    while (list.length < 6) {
      list = [...list, ...members];
    }
    return list;
  }, [members]);

  // Dynamic animation duration based on card count (smooth ~50px/sec pace)
  const duration = Math.max(25, displayMembers.length * 3.8);

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-400 border-3 border-black flex items-center justify-center font-black shadow-[3px_3px_0px_0px_#000] shrink-0">
            <Users className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 style={{ color: '#000000' }} className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-black">
              Pengurus & Struktur Organisasi
            </h2>
            <p style={{ color: '#020617' }} className="text-xs sm:text-sm font-extrabold text-slate-950 mt-0.5">
              Mengenal para pegiat pemuda yang mengabdi dan berkarya di San Chapter Tasikmalaya
            </p>
          </div>
        </div>

        {/* Action Controls - Clean button without manual arrows */}
        <div className="flex items-center gap-2 sm:justify-end">
          <Link href="/anggota">
            <RetroButton variant="outline" size="sm" className="font-black text-black">
              Direktori Lengkap <ArrowRight className="w-4 h-4 text-black shrink-0" />
            </RetroButton>
          </Link>
        </div>
      </div>

      {/* Member Cards Infinite Marquee */}
      {loading ? (
        <div className="flex gap-6 overflow-hidden py-2">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="w-64 sm:w-72 shrink-0 rounded-3xl border-3 border-black bg-white p-4 animate-pulse space-y-3 shadow-[4px_4px_0px_0px_#000]"
            >
              <div className="h-56 bg-slate-200 rounded-2xl border-2 border-black" />
              <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
              <div className="h-3 bg-slate-200 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white border-3 border-black rounded-3xl p-8 md:p-12 text-center space-y-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000]">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          </div>
          <div className="space-y-1">
            <h3 style={{ color: '#000000' }} className="font-black text-black text-lg md:text-xl">
              Gagal Memuat Data Pengurus
            </h3>
            <p style={{ color: '#020617' }} className="text-xs md:text-sm font-bold text-slate-900 max-w-md mx-auto">
              Terjadi kendala saat menghubungkan ke database. Silakan klik tombol di bawah untuk mencoba kembali.
            </p>
          </div>
          <RetroButton variant="primary" size="sm" onClick={fetchMembers} className="mx-auto font-black text-black">
            <RotateCw className="w-4 h-4 mr-1 text-black" /> Coba Lagi
          </RetroButton>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white border-3 border-black rounded-3xl p-8 md:p-12 text-center space-y-3 shadow-[4px_4px_0px_0px_#000]">
          <div className="w-14 h-14 rounded-2xl bg-cyan-100 border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000]">
            <Users className="w-7 h-7 text-black" />
          </div>
          <h3 style={{ color: '#000000' }} className="font-black text-black text-lg md:text-xl">
            Belum Ada Data Pengurus Ditampilkan
          </h3>
          <p style={{ color: '#020617' }} className="text-xs md:text-sm font-bold text-slate-900 max-w-md mx-auto">
            Daftar pengurus, relawan, dan struktur organisasi resmi San Chapter Tasikmalaya akan segera hadir di sini setelah ditambahkan melalui panel admin.
          </p>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden py-2 marquee-container">
          {/* Subtle edge fade overlays for seamless entrance/exit */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#fffbeb] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#fffbeb] to-transparent z-10" />

          {/* Marquee Track with infinite continuous loop */}
          <div
            className="animate-marquee"
            style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
          >
            {/* Primary Track */}
            <div className="flex gap-6 shrink-0 pr-6">
              {displayMembers.map((member, idx) => (
                <MemberCard key={`track1-${member.id || idx}-${idx}`} member={member} />
              ))}
            </div>

            {/* Cloned Track for Seamless Infinite Wrap */}
            <div className="flex gap-6 shrink-0 pr-6" aria-hidden="true">
              {displayMembers.map((member, idx) => (
                <MemberCard key={`track2-${member.id || idx}-${idx}`} member={member} isClone />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
