'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { MessageSquare, Mail, ArrowLeft, Settings, Check, ExternalLink, RotateCw, AlertTriangle } from 'lucide-react';
import { InstagramIcon, YoutubeIcon } from '@/components/ui/SocialIcons';
import { getSiteSettings, updateSiteSettingsAction } from '@/app/actions/settingsActions';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    instagramUrl: 'https://www.instagram.com/san.tasikmalaya.2020/',
    youtubeUrl: 'https://www.youtube.com/@sanchaptertasikmalaya3661',
    whatsappNumber: '081234567890',
    email: 'san.tasikmalaya.2020@gmail.com',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSiteSettings();
      if (data) setSettings(data);
    } catch (err) {
      console.warn('Failed to load settings:', err);
      setError('Gagal memuat pengaturan jejaring dari database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSavedSuccess(false);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateSiteSettingsAction(formData);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin">
            <span className="text-xs font-black text-slate-600 hover:text-amber-600 flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Pengaturan Jejaring Sosial & Kontak
            </h1>
            <Badge variant="yellow" className="text-xs shrink-0">MongoDB Settings</Badge>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-black rounded-full animate-spin mx-auto" />
          <p className="font-extrabold text-slate-800 text-sm">Memuat pengaturan jejaring...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center space-y-3 bg-rose-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_#000] max-w-xl mx-auto">
          <div className="w-10 h-10 rounded-xl bg-rose-200 border-2 border-black flex items-center justify-center mx-auto text-rose-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="font-black text-rose-950 text-sm">{error}</p>
          <RetroButton variant="primary" size="sm" onClick={loadSettings} className="mx-auto font-black text-xs text-black">
            <RotateCw className="w-3.5 h-3.5 mr-1 text-black" /> Coba Lagi
          </RetroButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form Section (7 Cols) */}
          <div className="lg:col-span-7">
            <RetroCard badgeBg="bg-white" className="space-y-5">
              <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                <h3 className="text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>Form Tautan Media Sosial Resmi</span>
                </h3>
                {savedSuccess && (
                  <Badge variant="green" className="text-xs bg-emerald-300 text-slate-950 font-black animate-bounce">
                    <Check className="w-3.5 h-3.5 inline mr-1" /> Tersimpan!
                  </Badge>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-black text-slate-950 mb-1.5 uppercase text-xs flex items-center gap-1.5">
                    <InstagramIcon className="w-4 h-4 text-rose-500 shrink-0" />
                    Tautan Instagram Resmi:
                  </label>
                  <input
                    type="url"
                    name="instagramUrl"
                    required
                    value={settings.instagramUrl}
                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    placeholder="https://www.instagram.com/san.tasikmalaya.2020/"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-950 mb-1.5 uppercase text-xs flex items-center gap-1.5">
                    <YoutubeIcon className="w-4 h-4 text-red-600 shrink-0" />
                    Tautan Kanal YouTube Resmi:
                  </label>
                  <input
                    type="url"
                    name="youtubeUrl"
                    required
                    value={settings.youtubeUrl}
                    onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/@sanchaptertasikmalaya3661"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-black text-slate-950 mb-1.5 uppercase text-xs flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      Nomor WhatsApp Center:
                    </label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      required
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-950 mb-1.5 uppercase text-xs flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-cyan-600 shrink-0" />
                      Email Resmi Organisasi:
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      placeholder="san.tasikmalaya.2020@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <RetroButton variant="primary" size="md" type="submit" disabled={submitting} className="w-full justify-center">
                    {submitting ? 'Memproses...' : 'Simpan Pengaturan Jejaring'}
                  </RetroButton>
                </div>
              </form>
            </RetroCard>
          </div>

          {/* Right Live Preview Cards (5 Cols) */}
          <div className="lg:col-span-5">
            <RetroCard badgeBg="bg-white" className="space-y-4">
              <div className="border-b-2 border-slate-200 pb-3">
                <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-cyan-600 shrink-0" />
                  Pratinjau Langsung Uji Coba Tautan
                </h3>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  Klik tombol di bawah ini untuk menguji tautan sosial yang akan tampil di Footer publik
                </p>
              </div>

              <div className="space-y-3">
                {/* Instagram Preview */}
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-100 to-rose-100 border-2 border-black flex items-center justify-between shadow-[3px_3px_0px_0px_#000] hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000]">
                      <InstagramIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-950 text-sm">Instagram @san.tasikmalaya.2020</h4>
                      <p className="text-[11px] font-bold text-slate-600 truncate max-w-[180px] sm:max-w-[220px]">
                        {settings.instagramUrl}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-950 shrink-0" />
                </a>

                {/* YouTube Preview */}
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-rose-50 border-2 border-black flex items-center justify-between shadow-[3px_3px_0px_0px_#000] hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000]">
                      <YoutubeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-950 text-sm">YouTube Official Channel</h4>
                      <p className="text-[11px] font-bold text-slate-600 truncate max-w-[180px] sm:max-w-[220px]">
                        {settings.youtubeUrl}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-950 shrink-0" />
                </a>

                {/* WhatsApp & Email Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-emerald-100 border-2 border-black flex items-center gap-2.5 shadow-[2px_2px_0px_0px_#000]"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-800 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-black uppercase text-emerald-900">WhatsApp</span>
                      <span className="block text-xs font-black text-slate-950 truncate">{settings.whatsappNumber}</span>
                    </div>
                  </a>

                  <a
                    href={`mailto:${settings.email}`}
                    className="p-3 rounded-2xl bg-cyan-100 border-2 border-black flex items-center gap-2.5 shadow-[2px_2px_0px_0px_#000]"
                  >
                    <Mail className="w-4 h-4 text-cyan-800 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-black uppercase text-cyan-900">Email</span>
                      <span className="block text-xs font-black text-slate-950 truncate">{settings.email}</span>
                    </div>
                  </a>
                </div>
              </div>
            </RetroCard>
          </div>
        </div>
      )}
    </div>
  );
}
