'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { getCroppedImg, PixelCrop } from '@/lib/cropImage';
import { RetroButton } from '@/components/ui/RetroButton';
import { Badge } from '@/components/ui/Badge';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  cropShape?: 'round' | 'rect';
  initialAspect?: number;
  allowAspectRatioChange?: boolean;
  title?: string;
  onClose: () => void;
  onCropComplete: (result: { file: File; blob: Blob; url: string }) => void;
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  fileName = 'image.jpg',
  cropShape = 'rect',
  initialAspect = 16 / 9,
  allowAspectRatioChange = true,
  title = 'Sesuaikan & Edit Foto',
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(initialAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspect(initialAspect);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedResult = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        fileName
      );
      onCropComplete(croppedResult);
      onClose();
    } catch (err) {
      console.error('Error saat cropping gambar:', err);
      alert('Gagal memotong gambar. Silakan coba kembali.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border-4 border-black rounded-3xl w-full max-w-2xl shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-3 border-black bg-amber-300">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Crop className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-black leading-tight">
                {title}
              </h3>
              <p className="text-[11px] font-bold text-slate-800">
                {cropShape === 'round'
                  ? 'Sesuaikan posisi avatar lingkaran (Discord Style)'
                  : 'Geser dan perbesar untuk mendapatkan proporsi pas'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl border-2 border-black bg-white hover:bg-rose-300 text-black flex items-center justify-center font-black transition-colors shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Cropper Canvas Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="relative w-full h-64 sm:h-80 md:h-96 bg-slate-950 border-3 border-black rounded-2xl overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape={cropShape}
              showGrid={cropShape !== 'round'}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropAreaComplete}
              zoomSpeed={1.2}
              classes={{
                containerClassName: 'rounded-2xl',
              }}
            />
          </div>

          {/* Aspect Ratio Selector (Optional / If Enabled) */}
          {allowAspectRatioChange && cropShape !== 'round' && (
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t-2 border-slate-100">
              <span className="text-xs font-black uppercase text-slate-900">
                Rasio Aspek:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: '16:9 Sampul', val: 16 / 9 },
                  { label: '4:3 Klasik', val: 4 / 3 },
                  { label: '1:1 Persegi', val: 1 },
                  { label: 'Bebas', val: undefined },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setAspect(item.val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black border-2 transition-all cursor-pointer ${
                      aspect === item.val
                        ? 'bg-amber-400 border-black shadow-[2px_2px_0px_0px_#000] text-black'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-black'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zoom & Rotation Controls */}
          <div className="p-3.5 bg-slate-100 border-2 border-black rounded-2xl space-y-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 shrink-0 text-slate-800">
                <ZoomOut className="w-4 h-4" />
                <span className="text-xs font-black">Zoom</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.02}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer h-2 bg-slate-300 rounded-lg appearance-none"
              />
              <div className="flex items-center gap-1 shrink-0">
                <ZoomIn className="w-4 h-4 text-slate-800" />
                <span className="text-xs font-mono font-black text-slate-950 bg-white border border-black px-2 py-0.5 rounded-md min-w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>

            {/* Quick Actions (Rotate & Reset) */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
              <button
                type="button"
                onClick={handleRotate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black rounded-xl text-xs font-bold text-slate-900 hover:bg-slate-200 transition-colors shadow-[1.5px_1.5px_0px_0px_#000] cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-black" />
                <span>Putar 90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border-2 border-black rounded-xl text-xs font-bold text-slate-700 hover:bg-rose-100 hover:text-rose-950 transition-colors shadow-[1.5px_1.5px_0px_0px_#000] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t-3 border-black bg-slate-50 flex items-center justify-end gap-3">
          <RetroButton
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isProcessing}
            className="bg-white"
          >
            Batal
          </RetroButton>

          <RetroButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleApply}
            disabled={isProcessing}
            className="bg-emerald-400 hover:bg-emerald-300"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1 inline" /> Memotong...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-1 inline" /> Terapkan (Apply)
              </>
            )}
          </RetroButton>
        </div>
      </div>
    </div>
  );
}
