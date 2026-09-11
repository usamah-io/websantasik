'use client';

import { useState } from 'react';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Send, Mail, MapPin, CheckCircle2, Sparkles, ArrowRight, Phone } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/SocialIcons';

export function ContactWidget() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [lastWaUrl, setLastWaUrl] = useState('');

  const OFFICIAL_WA_NUMBER = '6281234567890';
  const OFFICIAL_EMAIL = 'san.tasikmalaya.2020@gmail.com';
  const OFFICIAL_IG_URL = 'https://www.instagram.com/san.tasikmalaya.2020/';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Mohon masukkan Nama Lengkap Anda.');
      return;
    }
    if (!formData.whatsapp.trim()) {
      alert('Mohon masukkan Nomor WhatsApp Anda agar tim kami dapat merespons.');
      return;
    }
    if (!formData.message.trim()) {
      alert('Mohon tuliskan Pesan / Pertanyaan / Ajakan Kolaborasi Anda.');
      return;
    }

    const text = encodeURIComponent(
      `Halo Tim SAN Chapter Tasikmalaya,\n\n` +
      `Perkenalkan saya:\n` +
      `• Nama: ${formData.name.trim()}\n` +
      `• No. WhatsApp: ${formData.whatsapp.trim()}\n` +
      `• Email: ${formData.email.trim() || '-'}\n\n` +
      `Pesan / Ajakan Kolaborasi:\n${formData.message.trim()}`
    );

    const waUrl = `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${text}`;
    setLastWaUrl(waUrl);
    setSubmitted(true);

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');
  };

  const handleReset = () => {
    setFormData({ name: '', whatsapp: '', email: '', message: '' });
    setSubmitted(false);
    setLastWaUrl('');
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 border-3 border-black flex items-center justify-center font-black shadow-[3px_3px_0px_0px_#000] shrink-0">
            <MessageSquare className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 style={{ color: '#000000' }} className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-black">
              Hubungi & Kolaborasi
            </h2>
            <p style={{ color: '#020617' }} className="text-xs sm:text-sm font-extrabold text-slate-950 mt-0.5">
              Punya ide kegiatan, ajakan kolaborasi, atau ingin menyapa? Kirimkan pesan Anda langsung kepada kami
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Info Cards + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Brand Statement & Contact Details */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400 border-4 border-black rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_0px_#000] space-y-4">
            <Badge variant="yellow" className="bg-white text-slate-950 font-black">
              <Sparkles className="w-4 h-4 text-slate-950 inline mr-1" /> FAST RESPONSE
            </Badge>

            <h3 style={{ color: '#000000' }} className="text-2xl md:text-3xl font-black text-black leading-tight">
              Mari Bergerak & Menebar Senyuman Bersama!
            </h3>

            <p style={{ color: '#020617' }} className="text-sm font-extrabold text-slate-950 leading-relaxed">
              Kami selalu terbuka untuk berdiskusi dengan komunitas pemuda, institusi pendidikan, sponsor, dan pegiat seni budaya Tasikmalaya.
            </p>

            <div className="pt-2 flex flex-col gap-3">
              {/* WhatsApp Action Card (No raw number display) */}
              <a
                href={`https://wa.me/${OFFICIAL_WA_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-white border-3 border-black font-black text-slate-950 shadow-[3px_3px_0px_0px_#000] hover:bg-emerald-100 hover:translate-x-1 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400 border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_0px_#000]">
                    <Phone className="w-5 h-5 text-black" />
                  </div>
                  <div className="truncate">
                    <span className="block text-[10px] text-slate-600 uppercase font-black tracking-wider">Layanan Interaktif</span>
                    <span className="text-slate-950 font-black text-xs sm:text-sm">Hubungi Kami via WhatsApp</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-200 border-2 border-black flex items-center justify-center shrink-0 group-hover:bg-emerald-300 group-hover:translate-x-0.5 transition-all shadow-[1.5px_1.5px_0px_0px_#000]">
                  <ArrowRight className="w-4 h-4 text-black" />
                </div>
              </a>

              {/* Email Card */}
              <a
                href={`mailto:${OFFICIAL_EMAIL}`}
                className="group flex items-center gap-3 p-3.5 rounded-2xl bg-white border-3 border-black font-black text-slate-950 shadow-[3px_3px_0px_0px_#000] hover:bg-cyan-100 hover:translate-x-1 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-400 border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_0px_#000]">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <div className="truncate min-w-0">
                  <span className="block text-[10px] text-slate-600 uppercase font-black tracking-wider">Email Sekretariat</span>
                  <span className="text-slate-950 font-black truncate block text-xs sm:text-sm">{OFFICIAL_EMAIL}</span>
                </div>
              </a>

              {/* Instagram Card */}
              <a
                href={OFFICIAL_IG_URL}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 p-3.5 rounded-2xl bg-white border-3 border-black font-black text-slate-950 shadow-[3px_3px_0px_0px_#000] hover:bg-rose-100 hover:translate-x-1 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-400 border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_0px_#000]">
                  <InstagramIcon className="w-5 h-5 text-black" />
                </div>
                <div className="truncate min-w-0">
                  <span className="block text-[10px] text-slate-600 uppercase font-black tracking-wider">Instagram Resmi</span>
                  <span className="text-slate-950 font-black text-xs sm:text-sm">@san.tasikmalaya.2020</span>
                </div>
              </a>
            </div>
          </div>

          {/* Activity / Coverage Area Card */}
          <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <MapPin className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                Wilayah Pengabdian & Kegiatan
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-950 block">
                Kota & Kabupaten Tasikmalaya, Jawa Barat
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Neobrutalist Contact Form */}
        <div className="lg:col-span-7">
          <RetroCard badgeBg="bg-white" className="p-6 md:p-8 border-4 shadow-[8px_8px_0px_0px_#000]">
            {submitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-400 border-3 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
                  <CheckCircle2 className="w-10 h-10 text-black" />
                </div>

                <div className="space-y-2">
                  <h4 style={{ color: '#000000' }} className="text-2xl font-black text-black">
                    Pesan Anda Berhasil Disiapkan!
                  </h4>
                  <p style={{ color: '#020617' }} className="text-sm font-extrabold text-slate-950 max-w-md mx-auto">
                    Aplikasi WhatsApp telah dibuka untuk mengirim pesan Anda langsung ke tim pengurus. Jika belum terbuka otomatis, silakan klik tombol di bawah.
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  {lastWaUrl && (
                    <a href={lastWaUrl} target="_blank" rel="noreferrer">
                      <RetroButton variant="secondary" size="md" className="font-black text-black">
                        <Send className="w-4 h-4 text-black" /> Buka WhatsApp Lagi
                      </RetroButton>
                    </a>
                  )}
                  <RetroButton variant="outline" size="md" onClick={handleReset} className="font-black text-black">
                    Kirim Pesan Lain
                  </RetroButton>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                  <div>
                    <h3 style={{ color: '#000000' }} className="text-xl font-black text-black">
                      Kirim Pesan / Aspirasi
                    </h3>
                    <p style={{ color: '#020617' }} className="text-xs font-bold text-slate-700 mt-0.5">
                      Pesan Anda akan langsung terhubung ke layanan WhatsApp resmi kami.
                    </p>
                  </div>
                  <Badge variant="green" className="text-xs font-black uppercase text-black shrink-0">
                    ONLINE
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Lengkap Input */}
                  <div className="space-y-1.5">
                    <label style={{ color: '#000000' }} className="block text-xs font-black uppercase tracking-wider text-black">
                      Nama Lengkap <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Misal: Budi Gunawan"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold text-slate-950 placeholder:text-slate-400 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-sm"
                    />
                  </div>

                  {/* Nomor WhatsApp Input */}
                  <div className="space-y-1.5">
                    <label style={{ color: '#000000' }} className="block text-xs font-black uppercase tracking-wider text-black">
                      Nomor WhatsApp <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="Misal: 081234567890"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold text-slate-950 placeholder:text-slate-400 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Alamat Email (Opsi) Input */}
                <div className="space-y-1.5">
                  <label style={{ color: '#000000' }} className="block text-xs font-black uppercase tracking-wider text-black">
                    Alamat Email (Opsi)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Misal: budi@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold text-slate-950 placeholder:text-slate-400 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-sm"
                  />
                </div>

                {/* Pesan / Pertanyaan / Ajakan Kolaborasi Input */}
                <div className="space-y-1.5">
                  <label style={{ color: '#000000' }} className="block text-xs font-black uppercase tracking-wider text-black">
                    Pesan / Pertanyaan / Ajakan Kolaborasi <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tuliskan pesan, pertanyaan, atau rincian ajakan kolaborasi Anda di sini..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-bold text-slate-950 placeholder:text-slate-400 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-sm leading-relaxed"
                  />
                </div>

                {/* Submit Action: Prominently Styled Kirim Pesan WhatsApp Button */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 inline shrink-0" />
                    Data langsung terkirim secara aman via enkripsi chat WhatsApp.
                  </span>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 border-3 border-black text-black font-black text-sm sm:text-base shadow-[4px_4px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-5 h-5 text-black shrink-0" />
                    <span>Kirim Pesan WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </RetroCard>
        </div>
      </div>
    </section>
  );
}

