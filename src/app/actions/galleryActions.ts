'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { Gallery } from '@/lib/models/Gallery';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { recordAuditLog } from '@/lib/audit';
import { requireAdminSession } from '@/lib/auth';
import { convertGoogleDriveUrl } from '@/lib/imageUtils';

const initialGalleryPhotos = Array.from({ length: 20 }, (_, i) => ({
  id: `gallery-foto-${i + 1}`,
  title: `Dokumentasi Kegiatan #${i + 1}`,
  imageUrl: `/images/foto${i + 1}.jpg`,
  caption: i % 2 === 0
    ? `Aksi Sosial & Pendampingan Pembinaan Anak Nusantara #${i + 1}`
    : `Kebersamaan & Musyawarah Pengurus San Chapter Tasikmalaya #${i + 1}`,
  order: i + 1,
  isFeatured: true,
}));

export async function getGalleryPhotos() {
  try {
    await connectToDatabase();
    const docs = await Gallery.find({ isFeatured: true }).sort({ order: 1, createdAt: -1 }).lean();

    if (docs && docs.length > 0) {
      return docs.map((doc: any) => ({
        id: doc._id.toString(),
        title: doc.title,
        imageUrl: convertGoogleDriveUrl(doc.imageUrl),
        caption: doc.caption || '',
        order: doc.order || 0,
        isFeatured: doc.isFeatured,
      }));
    }
  } catch (err) {
    console.warn('DB gallery query error, fallback to foto1-20 local images:', (err as Error).message);
  }

  return initialGalleryPhotos.map((item) => ({
    ...item,
    imageUrl: convertGoogleDriveUrl(item.imageUrl),
  }));
}

export async function addGalleryPhotoAction(formData: FormData) {
  const session = await requireAdminSession();
  const title = (formData.get('title') as string) || 'Dokumentasi Baru';
  const caption = (formData.get('caption') as string) || '';
  const imageUrlInput = formData.get('imageUrl') as string | null;
  const imageFile = formData.get('image') as File | null;

  let finalImageUrl = '/images/foto1.jpg';

  if (imageFile && imageFile.size > 0 && imageFile.name) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    finalImageUrl = await uploadImageToCloudinary(buffer, imageFile.name);
  } else if (imageUrlInput && imageUrlInput.trim() !== '') {
    finalImageUrl = convertGoogleDriveUrl(imageUrlInput);
  }

  let createdId = 'gallery-' + Date.now();

  try {
    await connectToDatabase();
    const newDoc = await Gallery.create({
      title,
      imageUrl: finalImageUrl,
      caption,
      order: Date.now(),
      isFeatured: true,
    });
    createdId = newDoc._id.toString();

    await recordAuditLog({
      email: session.user.email,
      action: 'ADD_GALLERY_PHOTO',
      details: `Menambahkan foto dokumentasi baru: "${title}"`,
    });
  } catch (err) {
    const mockItem = {
      id: createdId,
      title,
      imageUrl: finalImageUrl,
      caption,
      order: Date.now(),
      isFeatured: true,
    };
    initialGalleryPhotos.unshift(mockItem);

    await recordAuditLog({
      email: session.user.email,
      action: 'ADD_GALLERY_PHOTO',
      details: `Menambahkan foto dokumentasi (Mode Lokal): "${title}"`,
    });
  }

  revalidatePath('/');
  revalidatePath('/admin/gallery');

  return { success: true, id: createdId };
}

export async function deleteGalleryPhotoAction(id: string) {
  const session = await requireAdminSession();

  try {
    await connectToDatabase();
    await Gallery.findByIdAndDelete(id);

    await recordAuditLog({
      email: session.user.email,
      action: 'DELETE_GALLERY_PHOTO',
      details: `Menghapus foto galeri ID: ${id}`,
    });
  } catch {}

  const idx = initialGalleryPhotos.findIndex((p) => p.id === id);
  if (idx !== -1) initialGalleryPhotos.splice(idx, 1);

  revalidatePath('/');
  revalidatePath('/admin/gallery');

  return { success: true };
}
