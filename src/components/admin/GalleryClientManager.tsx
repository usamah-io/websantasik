'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { Badge } from '@/components/ui/Badge';
import { GalleryPhoto } from '@/components/landing/HeroSlideshow';
import { addGalleryPhotoAction, deleteGalleryPhotoAction } from '@/app/actions/galleryActions';
import {
  Camera,
  Plus,
  Trash2,
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  CheckCircle,
  Loader2,
  AlertCircle,
  Crop,
} from 'lucide-react';
import { ImageCropperModal } from '@/components/ui/ImageCropperModal';

interface GalleryClientManagerProps {
  initialPhotos: GalleryPhoto[];
}

export function GalleryClientManager({ initialPhotos }: GalleryClientManagerProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Image Cropper States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('gallery.jpg');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const objUrl = URL.createObjectURL(file);
      setRawImageSrc(objUrl);
      setCropperOpen(true);
    }
  };

  const handleCropComplete = (result: { file: File; blob: Blob; url: string }) => {
    setCroppedFile(result.file);
    setCroppedPreview(result.url);
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus foto "${title}" dari slideshow?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteGalleryPhotoAction(id);
        if (res.success) {
          setPhotos((prev) => prev.filter((p) => p.id !== id));
          setStatusMsg({ type: 'success', text: `Foto "${title}" berhasil dihapus!` });
        }
      } catch (err) {
        setStatusMsg({ type: 'error', text: 'Gagal menghapus foto.' });
      }
    });
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (uploadMode === 'file') {
      if (!croppedFile) {
        alert('Silakan pilih dan sesuaikan (crop) gambar terlebih dahulu.');
        return;
      }
      formData.set('image', croppedFile);
    }

    startTransition(async () => {
      try {
        const res = await addGalleryPhotoAction(formData);
        if (res.success) {
          const title = (formData.get('title') as string) || 'Foto Baru';
          const caption = (formData.get('caption') as string) || '';
          const imageUrlInput = formData.get('imageUrl') as string | null;

          const newPhoto: GalleryPhoto = {
            id: res.id,
            title,
            imageUrl: croppedPreview || imageUrlInput || '/images/foto1.jpg',
            caption,
          };

          setPhotos((prev) => [newPhoto, ...prev]);
          setShowAddForm(false);
          setCroppedFile(null);
          setCroppedPreview(null);
          setRawImageSrc(null);
          form.reset();
          setStatusMsg({ type: 'success', text: `Foto "${title}" berhasil ditambahkan!` });
        }
      } catch (err) {
        setStatusMsg({ type: 'error', text: 'Gagal menambahkan foto ke galeri.' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-amber-400 border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <RetroButton variant="outline" size="sm" className="bg-white">
                <ArrowLeft className="w-4 h-4 text-slate-950" /> Dashboard Admin
              </RetroButton>
            </Link>
            <Badge variant="yellow" className="bg-white text-slate-950 font-black">
              <Camera className="w-4 h-4 text-slate-950" /> MANAJEMEN GALERI & SLIDESHOW
            </Badge>
          </div>
          <h1 className="text-3xl font-black text-slate-950">
            Kelola Foto Dokumentasi Hero Slideshow
          </h1>
          <p className="text-sm font-extrabold text-slate-900">
            Total Foto Aktif Dalam Slideshow: <span className="underline font-black">{photos.length} Foto</span>
          </p>
        </div>

        <RetroButton
          variant="primary"
          size="md"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-5 h-5 text-slate-950" /> {showAddForm ? 'Batal Tambah' : 'Tambah Foto Baru'}
        </RetroButton>
      </div>

      {/* Notification Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between font-bold text-sm ${
            statusMsg.type === 'success' ? 'bg-emerald-300 text-slate-950' : 'bg-rose-300 text-slate-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-slate-950" />
            ) : (
              <AlertCircle className="w-5 h-5 text-slate-950" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-xs underline font-black text-slate-950"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Add New Photo Form Modal/Box */}
      {showAddForm && (
        <RetroCard badgeBg="bg-white" className="p-6 border-4 border-black space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <Plus className="w-5 h-5 text-slate-950" /> Tambah Foto Ke Galeri Slideshow
            </h3>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-black text-xs font-black">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  uploadMode === 'file' ? 'bg-amber-400 border border-black shadow-[2px_2px_0px_0px_#000]' : 'text-slate-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5 inline mr-1" /> Unggah File
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  uploadMode === 'url' ? 'bg-amber-400 border border-black shadow-[2px_2px_0px_0px_#000]' : 'text-slate-700'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 inline mr-1" /> URL/Local Path
              </button>
            </div>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-950 uppercase">Judul Foto / Kegiatan</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Contoh: Bakti Sosial & Edukasi Pembinaan Anak"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-black font-bold text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-950 uppercase">Keterangan / Caption (Opsional)</label>
                <input
                  type="text"
                  name="caption"
                  placeholder="Contoh: Lokasi Tasikmalaya, Musyawarah Pengurus"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-black font-bold text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {uploadMode === 'file' ? (
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-950 uppercase">
                  Pilih & Edit Gambar (Cropper Interaktif)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 rounded-xl bg-slate-100 border-2 border-black text-sm font-bold text-slate-950 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-2 file:border-black file:bg-amber-400 file:text-xs file:font-black cursor-pointer"
                />

                {croppedPreview && (
                  <div className="p-3 bg-amber-50/90 border-2 border-black rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-slate-950 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Pratinjau Hasil Crop (Proporsional):
                      </span>
                      <button
                        type="button"
                        onClick={() => setCropperOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-black text-xs font-black text-slate-950 hover:bg-amber-300 shadow-[1.5px_1.5px_0px_0px_#000] cursor-pointer"
                      >
                        <Crop className="w-3 h-3" /> Edit / Crop Ulang
                      </button>
                    </div>
                    <div className="relative aspect-video w-full rounded-xl border-2 border-black overflow-hidden bg-slate-950 shadow-[2px_2px_0px_0px_#000]">
                      <img
                        src={croppedPreview}
                        alt="Hasil Crop"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-950 uppercase">URL Gambar / Path Lokal</label>
                <input
                  type="text"
                  name="imageUrl"
                  placeholder="/images/foto1.jpg atau https://..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-black font-bold text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <RetroButton
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowAddForm(false)}
              >
                Batal
              </RetroButton>
              <RetroButton
                type="submit"
                variant="accent"
                size="md"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950 inline mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Foto Ke Slideshow'
                )}
              </RetroButton>
            </div>
          </form>
        </RetroCard>
      )}

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo, index) => (
          <RetroCard key={photo.id || index} badgeBg="bg-white" className="p-3 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="relative aspect-[4/3] rounded-xl border-2 border-black overflow-hidden bg-slate-900 group">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-400 border border-black font-black text-[10px] text-slate-950">
                    #{index + 1}
                  </span>
                </div>
              </div>
              <h4 className="font-black text-slate-950 text-sm line-clamp-1">
                {photo.title}
              </h4>
              {photo.caption && (
                <p className="font-bold text-slate-700 text-xs line-clamp-2">
                  {photo.caption}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 truncate max-w-[140px]">
                {photo.imageUrl}
              </span>
              <button
                onClick={() => handleDelete(photo.id, photo.title)}
                disabled={isPending}
                className="p-1.5 rounded-lg bg-rose-100 border border-black text-rose-700 hover:bg-rose-400 hover:text-white transition-colors"
                title="Hapus foto dari galeri"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </RetroCard>
        ))}
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawImageSrc}
        fileName={selectedFileName}
        cropShape="rect"
        initialAspect={16 / 9}
        allowAspectRatioChange={true}
        title="Sesuaikan Foto Dokumentasi Galeri"
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
