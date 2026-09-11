import { getNewsBySlug } from '@/app/actions/newsActions';
import { RetroCard } from '@/components/ui/RetroCard';
import { Badge } from '@/components/ui/Badge';
import { RetroButton } from '@/components/ui/RetroButton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Eye, User, Share2, Camera } from 'lucide-react';

export const dynamic = 'force-dynamic';

const FALLBACK_NEWS_IMAGE = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop';

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  const displayImage = article.imageUrl && article.imageUrl.trim() !== '' ? article.imageUrl : FALLBACK_NEWS_IMAGE;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 relative z-10">
      {/* High-z-index Back Button Container */}
      <div className="relative z-30 inline-block">
        <Link href="/berita">
          <RetroButton variant="outline" size="sm" className="bg-white border-3 shadow-[3px_3px_0px_0px_#000]">
            <ArrowLeft className="w-4 h-4 text-slate-950" /> Kembali ke Daftar Berita
          </RetroButton>
        </Link>
      </div>

      <RetroCard badgeBg="bg-white" className="space-y-6 p-6 md:p-10 relative z-20">
        <div className="space-y-3">
          <Badge variant="yellow">{article.category}</Badge>

          <h1 className="text-2xl md:text-4xl font-black text-slate-950 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 border-b-2 border-slate-200 pb-4">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-500" /> {article.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-500" />
              {new Date(article.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-500" /> {article.views} Kali Dilihat
            </span>
          </div>
        </div>

        {/* Primary Cover Image */}
        <div className="rounded-2xl border-3 border-black overflow-hidden max-h-[420px] bg-slate-100 shadow-[4px_4px_0px_0px_#000]">
          <img
            src={displayImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-amber-50 border-2 border-black p-4 rounded-2xl font-bold text-slate-800 text-sm md:text-base leading-relaxed">
          {article.summary}
        </div>

        <div className="prose prose-slate max-w-none text-slate-900 font-medium leading-relaxed whitespace-pre-line space-y-4">
          {article.content}
        </div>

        {/* Additional Event Photos Gallery Grid */}
        {article.images && article.images.length > 0 && (
          <div className="space-y-4 pt-6 border-t-2 border-slate-200">
            <div className="flex items-center gap-2">
              <Badge variant="blue" className="bg-cyan-300 text-slate-950 font-black border-2 border-black">
                <Camera className="w-4 h-4 text-slate-950 inline mr-1" />
                GALERI DOKUMENTASI KEGIATAN ({article.images.length} FOTO)
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {article.images.map((imgUrl: string, idx: number) => (
                <div
                  key={idx}
                  className="relative aspect-[4/3] rounded-2xl border-2 border-black overflow-hidden bg-slate-900 shadow-[4px_4px_0px_0px_#000] group"
                >
                  <img
                    src={imgUrl}
                    alt={`Dokumentasi tambahan ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400 border border-black font-black text-[10px] text-slate-950">
                      #{idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t-2 border-slate-200 flex items-center justify-between">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
            San Tasikmalaya Official Article
          </span>
          <RetroButton variant="accent" size="sm">
            <Share2 className="w-3.5 h-3.5" /> Bagikan Artikel
          </RetroButton>
        </div>
      </RetroCard>
    </div>
  );
}
