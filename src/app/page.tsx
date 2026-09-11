'use client';

import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroCard } from '@/components/ui/RetroCard';
import { Badge } from '@/components/ui/Badge';
import { HeroSlideshow, GalleryPhoto } from '@/components/landing/HeroSlideshow';
import { MemberCarousel } from '@/components/landing/MemberCarousel';
import { ContactWidget } from '@/components/landing/ContactWidget';
import { getGalleryPhotos } from '@/app/actions/galleryActions';
import { getLatestNews } from '@/app/actions/newsActions';
import {
  FileText,
  Users,
  ArrowRight,
  Heart,
  Zap,
  Compass,
  Award,
  BookOpen,
  Calendar,
  Eye,
  User,
} from 'lucide-react';

const FALLBACK_NEWS_IMAGE = '/images/san-activity.jpg';

export default function LandingPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    getGalleryPhotos().then((fetchedPhotos) => {
      if (fetchedPhotos && fetchedPhotos.length > 0) {
        setPhotos(fetchedPhotos);
      }
    });

    getLatestNews(3)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setLatestNews(data);
        } else {
          setLatestNews([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load latest news:', err);
        setLatestNews([]);
      })
      .finally(() => {
        setLoadingNews(false);
      });
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section with Grid Layout & Retro Slideshow */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400 border-4 border-black p-6 md:p-12 shadow-[8px_8px_0px_0px_#000]">
        {/* Floating Decors */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-6 right-8 hidden xl:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] z-20"
        >
          <Award className="w-5 h-5 text-slate-950" />
          <span className="font-black text-xs text-slate-950 uppercase tracking-wider">
            TASIKMALAYA PRIDE 2026
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Hero Text & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="yellow" className="bg-white text-slate-950 border-3 font-black">
              <BookOpen className="w-4 h-4 text-slate-950" /> PLATFORM RESMI PEMUDA & KEBUDAYAAN
            </Badge>

            <div className="space-y-3">
              <h1 style={{ color: '#000000' }} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-black leading-tight">
                SAN CHAPTER{' '}
                <span style={{ color: '#000000' }} className="inline-block bg-white text-black px-4 py-1.5 rounded-2xl border-3 border-black rotate-[-2deg] shadow-[4px_4px_0px_0px_#000] my-1">
                  TASIKMALAYA
                </span>
              </h1>
              <p style={{ color: '#000000' }} className="text-lg md:text-xl font-extrabold text-black tracking-wide">
                Senyum Anak Nusantara Chapter Tasikmalaya
              </p>
            </div>

            <p style={{ color: '#020617' }} className="text-base md:text-lg font-extrabold text-slate-950 leading-relaxed max-w-2xl">
              Wadah kolaborasi inklusif bagi generasi pemuda Kota & Kabupaten Tasikmalaya untuk berkarya di bidang seni, sosial, pendidikan, dan inovasi kemasyarakatan.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/berita">
                <RetroButton variant="primary" size="lg" className="font-black text-black">
                  <FileText className="w-5 h-5 text-black" /> Jelajahi Berita
                </RetroButton>
              </Link>
              <Link href="/anggota">
                <RetroButton variant="outline" size="lg" className="font-black text-black">
                  <Users className="w-5 h-5 text-black" /> Direktori Pengurus
                </RetroButton>
              </Link>
            </div>
          </div>

          {/* Right Column: Neo-Brutalist Photo Frame Slideshow */}
          <div className="lg:col-span-5 w-full">
            <HeroSlideshow photos={photos} />
          </div>
        </div>
      </section>

      {/* Vision & Mission Grid with Enhanced High-Contrast Typography */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-400 border-3 border-black flex items-center justify-center font-black shadow-[3px_3px_0px_0px_#000] shrink-0">
              <Compass className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 style={{ color: '#000000' }} className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-black">
                Fokus & Pilar Gerakan
              </h2>
              <p style={{ color: '#020617' }} className="text-xs sm:text-sm font-extrabold text-slate-950 mt-0.5">
                Tiga pilar utama pengabdian Senyum Anak Nusantara Chapter Tasikmalaya
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <RetroCard badgeBg="bg-rose-100" className="h-full space-y-4 p-6 sm:p-7 border-4 shadow-[6px_6px_0px_0px_#000]">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-rose-400 border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                  <Heart className="w-7 h-7 text-black fill-rose-100" />
                </div>
                <Badge variant="pink" className="text-xs font-black uppercase text-black">PILAR 01</Badge>
              </div>
              <h3 style={{ color: '#000000' }} className="text-2xl font-black text-black tracking-tight">Aksi Social Care</h3>
              <p style={{ color: '#020617' }} className="text-sm font-extrabold text-slate-950 leading-relaxed">
                Bakti sosial nyata, tanggap bencana, dan pendampingan pendidikan anak pelosok Tasikmalaya.
              </p>
            </RetroCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <RetroCard badgeBg="bg-amber-100" className="h-full space-y-4 p-6 sm:p-7 border-4 shadow-[6px_6px_0px_0px_#000]">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                  <Award className="w-7 h-7 text-black" />
                </div>
                <Badge variant="yellow" className="text-xs font-black uppercase text-black">PILAR 02</Badge>
              </div>
              <h3 style={{ color: '#000000' }} className="text-2xl font-black text-black tracking-tight">Seni & Kebudayaan</h3>
              <p style={{ color: '#020617' }} className="text-sm font-extrabold text-slate-950 leading-relaxed">
                Pelestarian kekayaan tradisi, kreasi seni daerah, dan kearifan lokal Tasikmalaya.
              </p>
            </RetroCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <RetroCard badgeBg="bg-emerald-100" className="h-full space-y-4 p-6 sm:p-7 border-4 shadow-[6px_6px_0px_0px_#000]">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-400 border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                  <Zap className="w-7 h-7 text-black fill-yellow-300" />
                </div>
                <Badge variant="green" className="text-xs font-black uppercase text-black">PILAR 03</Badge>
              </div>
              <h3 style={{ color: '#000000' }} className="text-2xl font-black text-black tracking-tight">Inovasi Digital</h3>
              <p style={{ color: '#020617' }} className="text-sm font-extrabold text-slate-950 leading-relaxed">
                Pengembangan kecakapan digital pemuda dan pemberdayaan kreatif UMKM daerah.
              </p>
            </RetroCard>
          </motion.div>
        </div>
      </motion.section>

      {/* Member Swiper Carousel Section (Dynamic Profiles from MongoDB) */}
      <MemberCarousel />

      {/* Featured News Teaser Section (Dynamic 3 Latest Articles directly from MongoDB) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 border-3 border-black flex items-center justify-center font-black shadow-[3px_3px_0px_0px_#000] shrink-0">
              <FileText className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 style={{ color: '#000000' }} className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-black">
                Berita & Warta Organisasi
              </h2>
              <p style={{ color: '#020617' }} className="text-xs sm:text-sm font-extrabold text-slate-950 mt-0.5">
                Rilis berita, liputan kegiatan, dan dokumentasi terkini seputar SAN Chapter Tasikmalaya
              </p>
            </div>
          </div>
          <div className="flex items-center sm:justify-end">
            <Link href="/berita">
              <RetroButton variant="accent" size="sm" className="font-black text-black">
                Lihat Semua Berita <ArrowRight className="w-4 h-4 text-black shrink-0" />
              </RetroButton>
            </Link>
          </div>
        </div>

        {loadingNews && latestNews.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-80 rounded-3xl border-3 border-black bg-white p-5 animate-pulse flex flex-col justify-between shadow-[4px_4px_0px_0px_#000]"
              >
                <div className="h-44 bg-slate-200 rounded-2xl border-2 border-black" />
                <div className="space-y-2 pt-3">
                  <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-200 rounded-lg w-full" />
                  <div className="h-3 bg-slate-200 rounded-lg w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : latestNews.length === 0 ? (
          <div className="bg-white border-3 border-black rounded-3xl p-8 md:p-12 text-center space-y-3 shadow-[4px_4px_0px_0px_#000]">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000]">
              <FileText className="w-7 h-7 text-black" />
            </div>
            <h3 style={{ color: '#000000' }} className="font-black text-black text-lg md:text-xl">
              Belum Ada Warta Berita Dipublikasikan
            </h3>
            <p style={{ color: '#020617' }} className="text-xs md:text-sm font-bold text-slate-900 max-w-md mx-auto">
              Artikel dan dokumentasi kegiatan resmi San Chapter Tasikmalaya akan segera hadir di sini setelah dirilis oleh tim redaksi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.map((article) => (
              <RetroCard
                key={article.id || article.slug}
                badgeBg="bg-white"
                className="h-full flex flex-col justify-between space-y-4 border-3 shadow-[4px_4px_0px_0px_#000] group hover:translate-y-[-2px] transition-all"
              >
                <div className="space-y-3">
                  <div className="relative h-48 rounded-2xl border-2 border-black overflow-hidden bg-slate-100">
                    <img
                      src={article.imageUrl || FALLBACK_NEWS_IMAGE}
                      alt={article.title}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_NEWS_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <Badge
                        variant={
                          article.category === 'Kegiatan'
                            ? 'yellow'
                            : article.category === 'Organisasi'
                            ? 'green'
                            : 'blue'
                        }
                        className="text-black font-black"
                      >
                        {article.category || 'Warta'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-black text-slate-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-black" />
                      <span style={{ color: '#000000' }}>
                        {article.createdAt
                          ? new Date(article.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Terbaru'}
                      </span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-amber-700" />
                      <span style={{ color: '#000000' }}>{article.views || 0} dilihat</span>
                    </span>
                  </div>

                  <Link href={`/berita/${article.slug}`}>
                    <h3
                      style={{ color: '#000000' }}
                      className="text-lg font-black text-black leading-snug line-clamp-2 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      {article.title}
                    </h3>
                  </Link>

                  <p
                    style={{ color: '#020617' }}
                    className="text-xs text-slate-950 font-bold line-clamp-3 leading-relaxed"
                  >
                    {article.summary}
                  </p>
                </div>

                <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between gap-2">
                  <span
                    style={{ color: '#000000' }}
                    className="text-[11px] font-black text-black flex items-center gap-1 truncate max-w-[120px]"
                  >
                    <User className="w-3 h-3 text-black shrink-0" />
                    {article.author || 'Humas'}
                  </span>

                  <Link href={`/berita/${article.slug}`}>
                    <button
                      style={{ color: '#000000' }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 border-2 border-black font-black text-xs text-black shadow-[2px_2px_0px_0px_#000] hover:bg-amber-300 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      Lihat Selengkapnya <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </button>
                  </Link>
                </div>
              </RetroCard>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Neobrutalist Contact/Chat Widget */}
      <ContactWidget />
    </div>
  );
}

