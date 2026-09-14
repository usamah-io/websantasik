export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Memotong gambar berdasarkan koordinat pixel dari react-easy-crop dan menghasilkan objek File, Blob, serta URL pratinjau.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  fileName = 'cropped-image.jpg'
): Promise<{ file: File; blob: Blob; url: string }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Gagal menginisialisasi 2D canvas context');
  }

  const rotRad = getRadianAngle(rotation);

  // Hitung ukuran bounding box setelah rotasi
  const bBoxWidth =
    Math.abs(Math.cos(rotRad) * image.naturalWidth) +
    Math.abs(Math.sin(rotRad) * image.naturalHeight);
  const bBoxHeight =
    Math.abs(Math.sin(rotRad) * image.naturalWidth) +
    Math.abs(Math.cos(rotRad) * image.naturalHeight);

  // Set ukuran canvas sementara untuk rotasi
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Transformasi konteks untuk rotasi di titik pusat
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);

  // Gambar gambar asli yang sudah terotasi
  ctx.drawImage(image, 0, 0);

  // Buat canvas kedua untuk memotong area pixelCrop yang tepat
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('Gagal menginisialisasi cropped canvas context');
  }

  // Tentukan resolusi target sesuai dimensi crop
  croppedCanvas.width = Math.round(pixelCrop.width);
  croppedCanvas.height = Math.round(pixelCrop.height);

  // Salin data gambar yang sudah di-crop dari canvas pertama
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal menghasilkan blob gambar dari canvas'));
          return;
        }

        const safeFileName = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.webp')
          ? fileName
          : `${fileName}.jpg`;

        const file = new File([blob], safeFileName, {
          type: blob.type || 'image/jpeg',
          lastModified: Date.now(),
        });

        const url = URL.createObjectURL(blob);
        resolve({ file, blob, url });
      },
      'image/jpeg',
      0.92
    );
  });
}
