'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { Badge } from '@/components/ui/Badge';
import { getNewsList, createNewsAction, updateNewsAction, deleteNewsAction } from '@/app/actions/newsActions';
import Link from 'next/link';
import { Newspaper, Plus, Trash2, ArrowLeft, Eye, Pencil, Image as ImageIcon, X } from 'lucide-react';

const FALLBACK_NEWS_IMAGE = '/images/san-activity.jpg';

export default function AdminBeritaPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  const fetchNews = async () => {
    setLoading(true);
    const data = await getNewsList();
    setArticles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingArticle(null);
    setAdditionalImages([]);
    setImagePreview(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (article: any) => {
    setEditingArticle(article);
    setAdditionalImages(article.images || []);
    setImagePreview(article.imageUrl || null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageInput = () => {
    setAdditionalImages((prev) => [...prev, '']);
  };

  const handleAdditionalImageChange = (index: number, value: string) => {
    setAdditionalImages((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveImageInput = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      let res;
      if (editingArticle) {
        formData.append('id', editingArticle.id);
        res = await updateNewsAction(formData);
      } else {
        res = await createNewsAction(formData);
      }

      if (res.success) {
        setShowModal(false);
        setEditingArticle(null);
        setImagePreview(null);
        setAdditionalImages([]);
        fetchNews();
      } else {
        alert(res.error || 'Gagal menyimpan berita.');
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus berita "${title}"?`)) {
      await deleteNewsAction(id);
      fetchNews();
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <Link href="/admin">
            <span className="text-xs font-black text-slate-600 hover:text-amber-600 flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Manajemen Berita
          </h1>
        </div>

        <RetroButton
          variant="primary"
          size="md"
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Tulis Berita Baru
        </RetroButton>
      </div>

      {/* Modal Form Create / Edit News */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 md:p-8 max-w-2xl w-full space-y-4 shadow-[8px_8px_0px_0px_#000] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-amber-500 shrink-0" />
                <span>{editingArticle ? 'Edit Berita Organisasi' : 'Tulis Berita Baru'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full border-2 border-black bg-rose-200 text-black font-black hover:bg-rose-400 shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-black text-slate-950 mb-1 uppercase text-xs">Judul Berita:</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingArticle?.title || ''}
                  placeholder="Misal: Festival Seni Budaya Tasikmalaya 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-slate-950 mb-1 uppercase text-xs">Kategori:</label>
                  <select
                    name="category"
                    defaultValue={editingArticle?.category || 'Kegiatan'}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Kegiatan" className="bg-white text-slate-950 font-bold">Kegiatan</option>
                    <option value="Organisasi" className="bg-white text-slate-950 font-bold">Organisasi</option>
                    <option value="Sosial" className="bg-white text-slate-950 font-bold">Sosial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-black text-slate-950 mb-1 uppercase text-xs">
                    URL Sampul (Drive / Direct):
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    defaultValue={editingArticle?.imageUrl || ''}
                    placeholder="https://drive.google.com/... atau https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Cloudinary Image File Upload */}
              <div>
                <label className="block font-black text-slate-950 mb-1 uppercase text-xs">
                  Atau Unggah Berkas Sampul:
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-950 font-extrabold bg-slate-50 border-2 border-black rounded-xl p-2 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-2 file:border-black file:text-xs file:font-black file:bg-amber-400 hover:file:bg-amber-300 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-2 h-32 w-full rounded-xl border-2 border-black overflow-hidden bg-slate-100">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Additional Event Photos Section (Google Drive Multi-Image Links) */}
              <div className="space-y-2 p-3 sm:p-4 rounded-2xl bg-amber-50/80 border-2 border-black">
                <div className="flex items-center justify-between gap-2">
                  <label className="block font-black text-slate-950 uppercase text-xs flex items-center gap-1.5 shrink min-w-0">
                    <ImageIcon className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">Galeri Dokumen (Drive):</span>
                  </label>
                  <RetroButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImageInput}
                    className="bg-white text-xs whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" /> Tambah Link
                  </RetroButton>
                </div>

                {additionalImages.length === 0 ? (
                  <p className="text-xs text-slate-600 font-medium italic">
                    Belum ada tautan gambar tambahan.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {additionalImages.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-950 shrink-0">#{idx + 1}</span>
                        <input
                          type="text"
                          name="additionalImages"
                          value={url}
                          onChange={(e) => handleAdditionalImageChange(idx, e.target.value)}
                          placeholder="https://drive.google.com/file/d/..."
                          className="flex-1 min-w-0 px-3 py-1.5 rounded-xl border-2 border-black font-extrabold text-xs bg-white text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImageInput(idx)}
                          className="p-1.5 rounded-lg bg-rose-200 border border-black text-rose-950 hover:bg-rose-400 shrink-0"
                          title="Hapus tautan ini"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-black text-slate-950 mb-1 uppercase text-xs">Ringkasan Singkat:</label>
                <textarea
                  name="summary"
                  required
                  rows={2}
                  defaultValue={editingArticle?.summary || ''}
                  placeholder="Ringkasan 1-2 kalimat..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block font-black text-slate-950 mb-1 uppercase text-xs">Isi Berita Lengkap:</label>
                <textarea
                  name="content"
                  required
                  rows={5}
                  defaultValue={editingArticle?.content || ''}
                  placeholder="Tulis artikel berita secara detail..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-bold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                <RetroButton variant="outline" size="md" onClick={() => setShowModal(false)} className="w-full sm:w-auto justify-center">
                  Batal
                </RetroButton>
                <RetroButton variant="primary" size="md" type="submit" disabled={submitting} className="w-full sm:w-auto justify-center">
                  {submitting ? 'Memproses...' : editingArticle ? 'Simpan Perubahan' : 'Publikasikan Berita'}
                </RetroButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* News Articles List */}
      <RetroCard badgeBg="bg-white" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-slate-200 pb-3">
          <h3 className="text-lg sm:text-xl font-black text-slate-950">
            Daftar Berita ({articles.length})
          </h3>
          <Badge variant="yellow" className="text-xs">MongoDB Collection</Badge>
        </div>

        {loading ? (
          <p className="text-center py-8 font-bold text-slate-600">Memuat berita...</p>
        ) : articles.length === 0 ? (
          <p className="text-center py-8 font-bold text-slate-600">Belum ada berita.</p>
        ) : (
          <div className="divide-y-2 divide-slate-100">
            {articles.map((item) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3 w-full md:w-auto min-w-0">
                  <img
                    src={item.imageUrl || FALLBACK_NEWS_IMAGE}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_NEWS_IMAGE;
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-black object-cover shrink-0"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="yellow" className="text-[10px] sm:text-xs py-0.5 px-2">{item.category}</Badge>
                      {item.images && item.images.length > 0 && (
                        <Badge variant="blue" className="text-[10px] py-0.5 px-2">
                          +{item.images.length} Galeri
                        </Badge>
                      )}
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                        {item.views || 0} views {item.author ? `• ${item.author}` : ''}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-950 text-sm sm:text-base leading-snug line-clamp-2 sm:line-clamp-none">
                      {item.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t border-slate-100 md:border-t-0">
                  <Link href={`/berita/${item.slug}`} target="_blank" className="flex-1 md:flex-none">
                    <button
                      className="w-full md:w-auto px-3 py-2 rounded-xl bg-cyan-200 border-2 border-black text-black font-black text-xs hover:bg-cyan-300 flex items-center justify-center gap-1.5"
                      title="Pratinjau Berita"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="md:hidden">Lihat</span>
                    </button>
                  </Link>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="flex-1 md:flex-none px-3 py-2 rounded-xl bg-amber-300 border-2 border-black text-black font-black text-xs hover:bg-amber-400 flex items-center justify-center gap-1.5"
                    title="Edit Berita"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="md:hidden">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="flex-1 md:flex-none px-3 py-2 rounded-xl bg-rose-200 border-2 border-black text-rose-950 font-black text-xs hover:bg-rose-400 flex items-center justify-center gap-1.5"
                    title="Hapus Berita"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="md:hidden">Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </RetroCard>
    </div>
  );
}
