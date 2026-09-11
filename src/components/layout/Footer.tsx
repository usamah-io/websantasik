import Link from 'next/link';
import { Heart, MapPin, Mail, Award } from 'lucide-react';
import { InstagramIcon, YoutubeIcon } from '@/components/ui/SocialIcons';
import { getSiteSettings } from '@/app/actions/settingsActions';

export async function Footer() {
  const settings = await getSiteSettings();
  const instagramUrl = settings?.instagramUrl || 'https://www.instagram.com/san.tasikmalaya.2020/';
  const youtubeUrl = settings?.youtubeUrl || 'https://www.youtube.com/@sanchaptertasikmalaya3661';
  const email = settings?.email || 'san.tasikmalaya.2020@gmail.com';

  return (
    <footer className="bg-slate-950 text-white border-t-4 border-black pt-12 pb-8 px-4 md:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1 */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-white flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_#f59e0b]">
              <img
                src="/logo.png"
                alt="San Chapter Tasikmalaya Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <span className="font-black text-xl tracking-wide text-amber-400">
              SAN CHAPTER TASIKMALAYA
            </span>
          </div>
          <p className="text-slate-300 text-sm max-w-md leading-relaxed font-medium">
            Senyum Anak Nusantara (SAN) Chapter Tasikmalaya. Wadah kolaborasi seni, budaya, sosial, dan pendidikan pemuda Kota & Kabupaten Tasikmalaya.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-amber-300 font-extrabold">
            <span className="flex items-center gap-1 text-slate-200">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" /> Tasikmalaya, Jawa Barat
            </span>
            <span>•</span>
            <a href={`mailto:${email}`} className="flex items-center gap-1 text-slate-200 hover:text-amber-400 transition-colors">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" /> {email}
            </a>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-black text-amber-400 text-base uppercase tracking-wider mb-3">
            Navigasi Public
          </h4>
          <ul className="space-y-2 text-sm font-bold text-slate-300">
            <li>
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Beranda Utama
              </Link>
            </li>
            <li>
              <Link href="/berita" className="hover:text-amber-400 transition-colors">
                Berita & Artikel
              </Link>
            </li>
            <li>
              <Link href="/anggota" className="hover:text-amber-400 transition-colors">
                Direktori Pengurus
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-black text-amber-400 text-base uppercase tracking-wider mb-3">
            Jejaring Sosial
          </h4>
          <div className="flex flex-col gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center sm:justify-start gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white border-2 border-black shadow-[3px_3px_0px_0px_#f43f5e] font-black text-xs sm:text-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <InstagramIcon className="w-5 h-5 text-white shrink-0" />
              <span>Follow Instagram Kami</span>
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center sm:justify-start gap-3 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white border-2 border-black shadow-[3px_3px_0px_0px_#ef4444] font-black text-xs sm:text-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <YoutubeIcon className="w-5 h-5 text-white shrink-0" />
              <span>Subscribe YouTube Kami</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© 2026 Senyum Anak Nusantara Chapter Tasikmalaya.</p>
        <p className="flex items-center gap-1 font-bold text-slate-300">
          Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> & <Award className="w-3.5 h-3.5 text-amber-400 inline" /> untuk Tasikmalaya.
        </p>
      </div>
    </footer>
  );
}
