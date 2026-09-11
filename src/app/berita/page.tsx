'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { RetroCard } from '@/components/ui/RetroCard';
import { Badge } from '@/components/ui/Badge';
import { getNewsList } from '@/app/actions/newsActions';
import { Search, Eye, Calendar, User, FileText, Filter, ArrowRight } from 'lucide-react';

const FALLBACK_NEWS_IMAGE = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop';

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Semua', 'Kegiatan', 'Organisasi', 'Sosial'];

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      const data = await getNewsList(searchQuery, selectedCategory);
      setArticles(data);
      setLoading(false);
    }
    const timer = setTimeout(loadNews, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-amber-300 border-4 border-black rounded-3xl p-6 md:p-10 shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <Badge variant="yellow" className="bg-white text-slate-950 font-black">
            <FileText className="w-4 h-4 text-slate-950" /> WARTA & KABAR ORGANISASI
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950">
            Kabar San Chapter Tasikmalaya
          </h1>
          <p className="text-slate-950 text-sm md:text-base font-bold">
            Temukan berita terkini, dokumentasi kegiatan, serta artikel seputar pergerakan pemuda dan kebudayaan Tasikmalaya.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border-3 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000]">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul berita atau kata kunci..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-black font-extrabold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-black uppercase text-slate-700 mr-1 hidden sm:flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-950" /> Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-400 border-black shadow-[2px_2px_0px_0px_#000] text-slate-950'
                  : 'bg-slate-100 border-slate-400 text-slate-800 hover:border-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-black rounded-full animate-spin mx-auto" />
          <p className="font-extrabold text-slate-800 text-sm">Mencari berita...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white border-3 border-black rounded-3xl p-12 text-center space-y-4 shadow-[4px_4px_0px_0px_#000]">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-black text-slate-950">Berita tidak ditemukan</h3>
          <p className="text-sm font-bold text-slate-700">
            Coba kata kunci lain atau pilih kategori &quot;Semua&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {articles.map((article) => (
              <motion.div
                key={article.id || article.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <RetroCard badgeBg="bg-white" className="h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="relative h-44 rounded-2xl border-2 border-black overflow-hidden bg-slate-100">
                      <img
                        src={article.imageUrl || FALLBACK_NEWS_IMAGE}
                        alt={article.title}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_NEWS_IMAGE;
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant={
                            article.category === 'Kegiatan'
                              ? 'yellow'
                              : article.category === 'Organisasi'
                              ? 'green'
                              : 'blue'
                          }
                          className="text-slate-950 font-black"
                        >
                          {article.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-black text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-950" />
                        {new Date(article.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-amber-700" /> {article.views} dilihat
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-950 leading-snug line-clamp-2 hover:text-amber-600 transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-800 font-bold line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-slate-600 flex items-center gap-1 truncate max-w-[120px]">
                      <User className="w-3 h-3 text-slate-700 shrink-0" /> {article.author}
                    </span>

                    <Link href={`/berita/${article.slug}`}>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 border-2 border-black font-black text-xs text-slate-950 shadow-[2px_2px_0px_0px_#000] hover:bg-amber-300 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all">
                        Lihat Selengkapnya <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                      </button>
                    </Link>
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
