'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RetroCard } from '@/components/ui/RetroCard';
import { Badge } from '@/components/ui/Badge';
import { getMembersList } from '@/app/actions/memberActions';
import { Users, Camera, Share2, Mail, Crown, Award, MessageSquare, Check, Copy } from 'lucide-react';

export default function AnggotaPage() {
  const [selectedDivision, setSelectedDivision] = useState('Semua');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const divisions = [
    'Semua',
    'Divisi PSDM',
    'Divisi Kominfo',
    'Divisi Rensos',
    'Divisi SC',
  ];

  useEffect(() => {
    async function loadMembers() {
      setLoading(true);
      const data = await getMembersList(selectedDivision);
      setMembers(data);
      setLoading(false);
    }
    loadMembers();
  }, [selectedDivision]);

  // Find Leader (Salman Al Farisi or member with role containing 'Ketua')
  const leader =
    members.find(
      (m) =>
        m.name.toLowerCase().includes('salman') ||
        m.role.toLowerCase().includes('ketua')
    ) || {
      id: 'mem-ketua-default',
      name: 'Salman Al Farisi',
      role: 'Ketua Chapter',
      division: 'Ketua Chapter',
      photoUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop',
      imagePosition: 'object-center',
      bio: 'Memimpin & mengabdi untuk kemajuan dan senyuman generasi pemuda Tasikmalaya.',
      email: 'salman@santasikmalaya.org',
      instagram: '@salman_alfarisi',
      whatsapp: '081234567890',
      linkedin: 'salman-al-farisi',
    };

  // Exclude Leader from general grid to avoid duplication if present
  const standardMembers = members.filter((m) => m.id !== leader.id);

  const handleShareMember = (member: any) => {
    const textToCopy = `${member.name} - ${member.role} (${member.division}) San Chapter Tasikmalaya`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(member.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getInstagramUrl = (handle?: string) => {
    if (!handle) return '#';
    if (handle.startsWith('http')) return handle;
    const clean = handle.replace('@', '').trim();
    return `https://instagram.com/${clean}`;
  };

  const getWhatsAppUrl = (number?: string) => {
    if (!number) return '#';
    const digits = number.replace(/[^0-9]/g, '');
    const cleanDigits = digits.startsWith('0') ? '62' + digits.slice(1) : digits;
    return `https://wa.me/${cleanDigits}`;
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-cyan-300 border-4 border-black rounded-3xl p-6 md:p-10 shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <Badge variant="green" className="bg-white text-slate-950 font-black">
            <Users className="w-4 h-4 text-slate-950" /> KEPENGURUSAN & KEANGGOTAAN
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950">
            Direktori San Chapter Tasikmalaya
          </h1>
          <p className="text-slate-950 text-sm md:text-base font-bold">
            Mengenal lebih dekat para sosok inspiratif di balik gerakan dan program Senyum Anak Nusantara Chapter Tasikmalaya.
          </p>
        </div>
      </div>

      {/* Prominent Highlighted Leader Section (Ketua: Salman Al Farisi) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-3xl bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400 border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_#000] overflow-hidden"
      >
        <div className="absolute top-4 right-4 hidden sm:flex items-center gap-2 bg-white px-3 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <Crown className="w-4 h-4 text-amber-600 fill-amber-400" />
          <span className="font-black text-xs text-slate-950 uppercase">PIMPINAN UTAMA</span>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Leader Photo */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-3xl border-3 border-black overflow-hidden shadow-[5px_5px_0px_0px_#000] bg-white">
            <img
              src={leader.photoUrl}
              alt={leader.name}
              className={`w-full h-full object-cover ${leader.imagePosition || 'object-center'}`}
            />
          </div>

          {/* Leader Info */}
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge variant="yellow" className="bg-white text-slate-950 font-black border-2 border-black">
                <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-400 inline mr-1" />
                KETUA CHAPTER
              </Badge>
              <Badge variant="blue" className="bg-cyan-300 text-slate-950 font-black border-2 border-black">
                <Award className="w-3.5 h-3.5 text-slate-950 inline mr-1" />
                PERIODE 2026
              </Badge>
            </div>

            <div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tight">
                {leader.name}
              </h2>
              <p className="text-sm md:text-base font-extrabold text-amber-900 uppercase tracking-wider mt-0.5">
                {leader.role || 'Ketua Chapter Tasikmalaya'}
              </p>
            </div>

            {leader.bio && (
              <p className="text-xs md:text-sm text-slate-900 font-bold bg-white/90 p-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] leading-relaxed max-w-xl italic">
                &quot;{leader.bio}&quot;
              </p>
            )}

            {/* Social Links */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-2.5">
              {leader.email && (
                <a
                  href={`mailto:${leader.email}`}
                  title={`Email: ${leader.email}`}
                  className="p-2 rounded-xl bg-white border-2 border-black hover:bg-amber-300 transition-colors shadow-[2px_2px_0px_0px_#000]"
                >
                  <Mail className="w-4 h-4 text-slate-950" />
                </a>
              )}
              {leader.instagram && (
                <a
                  href={getInstagramUrl(leader.instagram)}
                  target="_blank"
                  rel="noreferrer"
                  title={`Instagram: ${leader.instagram}`}
                  className="p-2 rounded-xl bg-white border-2 border-black hover:bg-rose-300 transition-colors shadow-[2px_2px_0px_0px_#000]"
                >
                  <Camera className="w-4 h-4 text-slate-950" />
                </a>
              )}
              {leader.whatsapp && (
                <a
                  href={getWhatsAppUrl(leader.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  title={`WhatsApp: ${leader.whatsapp}`}
                  className="p-2 rounded-xl bg-white border-2 border-black hover:bg-emerald-300 transition-colors shadow-[2px_2px_0px_0px_#000]"
                >
                  <MessageSquare className="w-4 h-4 text-slate-950" />
                </a>
              )}
              <button
                onClick={() => handleShareMember(leader)}
                title="Bagikan Info Pengurus"
                className="p-2 rounded-xl bg-white border-2 border-black hover:bg-cyan-300 transition-colors shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 text-xs font-black"
              >
                {copiedId === leader.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-950" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Division Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b-3 border-black scrollbar-none">
        {divisions.map((div) => (
          <button
            key={div}
            onClick={() => setSelectedDivision(div)}
            className={`px-4 py-2 rounded-2xl border-3 text-xs md:text-sm font-black whitespace-nowrap transition-all ${
              selectedDivision === div
                ? 'bg-amber-400 border-black shadow-[3px_3px_0px_0px_#000] text-slate-950'
                : 'bg-white border-slate-400 text-slate-800 hover:border-black'
            }`}
          >
            {div}
          </button>
        ))}
      </div>

      {/* Member Grid - 2 Columns on Mobile, 3-4 Columns on Desktop */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-black rounded-full animate-spin mx-auto" />
          <p className="font-extrabold text-slate-800 text-sm">Memuat direktori pengurus...</p>
        </div>
      ) : standardMembers.length === 0 ? (
        <div className="bg-white border-3 border-black rounded-3xl p-10 text-center space-y-3 shadow-[4px_4px_0px_0px_#000]">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-black text-slate-950">Belum ada anggota terdaftar di kategori ini</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          <AnimatePresence>
            {standardMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <RetroCard
                  badgeBg="bg-white"
                  className="h-full flex flex-col justify-between space-y-3 p-3 sm:p-5 text-center"
                >
                  <div className="space-y-2 sm:space-y-3">
                    {/* Compact Avatar for Mobile 2-col Grid */}
                    <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-2xl border-2 sm:border-3 border-black overflow-hidden shadow-[3px_3px_0px_0px_#000] bg-amber-100">
                      <img
                        src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                        alt={member.name}
                        className={`w-full h-full object-cover ${member.imagePosition || 'object-center'}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <Badge
                        variant={
                          member.division === 'Divisi PSDM'
                            ? 'yellow'
                            : member.division === 'Divisi Kominfo'
                            ? 'pink'
                            : member.division === 'Divisi Rensos'
                            ? 'green'
                            : 'blue'
                        }
                        className="text-[10px] sm:text-xs text-slate-950 font-black px-2 py-0.5"
                      >
                        {member.division}
                      </Badge>
                      <h3 className="text-xs sm:text-base font-black text-slate-950 leading-tight pt-1">
                        {member.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs font-black text-amber-700 uppercase tracking-wider">
                        {member.role}
                      </p>
                    </div>

                    {member.bio && (
                      <p className="text-[11px] sm:text-xs text-slate-900 font-semibold bg-amber-50/80 p-2 rounded-xl border border-slate-300 italic line-clamp-2">
                        &quot;{member.bio}&quot;
                      </p>
                    )}
                  </div>

                  {/* Compact Social & Contact Links */}
                  <div className="pt-2 border-t-2 border-slate-100 flex items-center justify-center gap-1.5 flex-wrap">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        title={`Email: ${member.email}`}
                        className="p-1.5 rounded-lg bg-slate-100 border border-black hover:bg-amber-300 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-950" />
                      </a>
                    )}
                    {member.instagram && (
                      <a
                        href={getInstagramUrl(member.instagram)}
                        target="_blank"
                        rel="noreferrer"
                        title={`Instagram: ${member.instagram}`}
                        className="p-1.5 rounded-lg bg-slate-100 border border-black hover:bg-rose-300 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-950" />
                      </a>
                    )}
                    {member.whatsapp && (
                      <a
                        href={getWhatsAppUrl(member.whatsapp)}
                        target="_blank"
                        rel="noreferrer"
                        title={`WhatsApp: ${member.whatsapp}`}
                        className="p-1.5 rounded-lg bg-slate-100 border border-black hover:bg-emerald-300 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-950" />
                      </a>
                    )}
                    <button
                      onClick={() => handleShareMember(member)}
                      title="Salin/Bagikan Info Pengurus"
                      className="p-1.5 rounded-lg bg-slate-100 border border-black hover:bg-cyan-300 transition-colors"
                    >
                      {copiedId === member.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-slate-950" />
                      )}
                    </button>
                  </div>
                </RetroCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
