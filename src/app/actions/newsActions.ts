'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { News } from '@/lib/models/News';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { recordAuditLog } from '@/lib/audit';
import { requireAdminSession } from '@/lib/auth';
import { convertGoogleDriveUrl } from '@/lib/imageUtils';

const FALLBACK_IMAGE_URL = '/images/san-activity.jpg';
const DUMMY_SLUGS = [
  'festival-seni-budaya-san-tasikmalaya-2026',
  'musyawarah-anggota-pemilihan-ketua-umum',
  'aksi-kebersihan-penanaman-pohon-galunggung',
];

const initialNews: Array<{
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  imageUrl?: string;
  images?: string[];
  author: string;
  views: number;
  createdAt: string;
}> = [];

export async function getNewsList(query?: string, category?: string) {
  try {
    await connectToDatabase();

    const filter: any = { isPublished: true };

    if (category && category !== 'Semua') {
      filter.category = category;
    }

    if (query && query.trim() !== '') {
      const regex = new RegExp(query, 'i');
      filter.$or = [{ title: regex }, { summary: regex }, { content: regex }];
    }

    const newsDocs = await News.find(filter).sort({ createdAt: -1 }).lean();

    if (newsDocs && newsDocs.length > 0) {
      return newsDocs.map((doc: any) => ({
        id: doc._id.toString(),
        title: doc.title,
        slug: doc.slug,
        summary: doc.summary,
        content: doc.content,
        category: doc.category,
        imageUrl: convertGoogleDriveUrl(doc.imageUrl) || FALLBACK_IMAGE_URL,
        images: Array.isArray(doc.images)
          ? doc.images.map((url: string) => convertGoogleDriveUrl(url)).filter(Boolean)
          : [],
        author: doc.author,
        views: doc.views || 0,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      }));
    }

    return [];
  } catch (e) {
    console.warn('DB query error in getNewsList:', (e as Error).message);
    return [];
  }
}

export async function getLatestNews(limit: number = 3) {
  try {
    await connectToDatabase();

    const newsDocs = await News.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (newsDocs && newsDocs.length > 0) {
      return newsDocs.map((doc: any) => ({
        id: doc._id.toString(),
        title: doc.title,
        slug: doc.slug,
        summary: doc.summary,
        content: doc.content,
        category: doc.category,
        imageUrl: convertGoogleDriveUrl(doc.imageUrl) || FALLBACK_IMAGE_URL,
        images: Array.isArray(doc.images)
          ? doc.images.map((url: string) => convertGoogleDriveUrl(url)).filter(Boolean)
          : [],
        author: doc.author,
        views: doc.views || 0,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      }));
    }

    return [];
  } catch (e) {
    console.warn('DB query error in getLatestNews:', (e as Error).message);
    return [];
  }
}

export async function getNewsBySlug(slug: string) {
  if (DUMMY_SLUGS.includes(slug)) {
    return null;
  }
  try {
    await connectToDatabase();
    const doc = await News.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true }).lean();
    if (doc) {
      return {
        id: (doc as any)._id.toString(),
        title: (doc as any).title,
        slug: (doc as any).slug,
        summary: (doc as any).summary,
        content: (doc as any).content,
        category: (doc as any).category,
        imageUrl: convertGoogleDriveUrl((doc as any).imageUrl) || FALLBACK_IMAGE_URL,
        images: Array.isArray((doc as any).images)
          ? (doc as any).images.map((url: string) => convertGoogleDriveUrl(url)).filter(Boolean)
          : [],
        author: (doc as any).author,
        views: (doc as any).views || 0,
        createdAt: (doc as any).createdAt ? new Date((doc as any).createdAt).toISOString() : new Date().toISOString(),
      };
    }
  } catch {}

  const found = initialNews.find((n) => n.slug === slug);
  if (found) {
    found.views += 1;
    return {
      ...found,
      imageUrl: convertGoogleDriveUrl(found.imageUrl) || FALLBACK_IMAGE_URL,
      images: (found.images || []).map((url) => convertGoogleDriveUrl(url)).filter(Boolean),
    };
  }
  return null;
}

export async function createNewsAction(formData: FormData) {
  const session = await requireAdminSession();
  const title = formData.get('title') as string;
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const category = (formData.get('category') as string) || 'Kegiatan';
  const author = session.user.name || 'Admin San Tasik';
  const imageFile = formData.get('image') as File | null;
  const imageUrlInput = formData.get('imageUrl') as string | null;

  const rawAdditionalImages = formData.getAll('additionalImages') as string[];
  const additionalImages = rawAdditionalImages
    .map((url) => convertGoogleDriveUrl(url))
    .filter((url) => url && url.trim() !== '');

  if (!title || !summary || !content) {
    return { success: false, error: 'Judul, ringkasan, dan isi berita wajib diisi.' };
  }

  let finalImageUrl = FALLBACK_IMAGE_URL;

  if (imageFile && imageFile.size > 0 && imageFile.name) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    finalImageUrl = await uploadImageToCloudinary(buffer, imageFile.name);
  } else if (imageUrlInput && imageUrlInput.trim() !== '') {
    finalImageUrl = convertGoogleDriveUrl(imageUrlInput);
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

  try {
    await connectToDatabase();
    const newDoc = await News.create({
      title,
      slug,
      summary,
      content,
      category,
      imageUrl: finalImageUrl,
      images: additionalImages,
      author,
      views: 0,
      isPublished: true,
    });

    await recordAuditLog({
      email: session.user.email,
      action: 'CREATE_NEWS',
      details: `Berita baru dibuat: "${title}" (ID: ${newDoc._id})`,
    });

    revalidatePath('/berita');
    revalidatePath('/admin/berita');
    revalidatePath('/');
    revalidatePath(`/berita/${slug}`);

    return { success: true, slug };
  } catch (err) {
    const mockNews = {
      id: 'news-' + Date.now(),
      title,
      slug,
      summary,
      content,
      category,
      imageUrl: finalImageUrl,
      images: additionalImages,
      author,
      views: 1,
      createdAt: new Date().toISOString(),
    };
    initialNews.unshift(mockNews);

    await recordAuditLog({
      email: session.user.email,
      action: 'CREATE_NEWS',
      details: `Berita baru dibuat (Mode Lokal): "${title}"`,
    });

    revalidatePath('/berita');
    revalidatePath('/admin/berita');
    revalidatePath('/');
    revalidatePath(`/berita/${slug}`);

    return { success: true, slug };
  }
}

export async function updateNewsAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const category = (formData.get('category') as string) || 'Kegiatan';
  const imageFile = formData.get('image') as File | null;
  const imageUrlInput = formData.get('imageUrl') as string | null;

  const rawAdditionalImages = formData.getAll('additionalImages') as string[];
  const additionalImages = rawAdditionalImages
    .map((url) => convertGoogleDriveUrl(url))
    .filter((url) => url && url.trim() !== '');

  if (!id || !title || !summary || !content) {
    return { success: false, error: 'ID berita, judul, ringkasan, dan isi berita wajib diisi.' };
  }

  let finalImageUrl: string | undefined;
  if (imageFile && imageFile.size > 0 && imageFile.name) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    finalImageUrl = await uploadImageToCloudinary(buffer, imageFile.name);
  } else if (imageUrlInput && imageUrlInput.trim() !== '') {
    finalImageUrl = convertGoogleDriveUrl(imageUrlInput);
  }

  let updatedSlug = '';

  try {
    await connectToDatabase();
    const updatePayload: any = {
      title,
      summary,
      content,
      category,
      images: additionalImages,
    };
    if (finalImageUrl) {
      updatePayload.imageUrl = finalImageUrl;
    }

    const updatedDoc = await News.findByIdAndUpdate(id, updatePayload, { new: true });
    if (updatedDoc) {
      updatedSlug = updatedDoc.slug;
    }

    await recordAuditLog({
      email: session.user.email,
      action: 'UPDATE_NEWS',
      details: `Berita diperbarui: "${title}" (ID: ${id})`,
    });
  } catch (err) {
    const foundIndex = initialNews.findIndex((n) => n.id === id);
    if (foundIndex !== -1) {
      initialNews[foundIndex] = {
        ...initialNews[foundIndex],
        title,
        summary,
        content,
        category,
        imageUrl: finalImageUrl || initialNews[foundIndex].imageUrl,
        images: additionalImages,
      };
      updatedSlug = initialNews[foundIndex].slug;
    }

    await recordAuditLog({
      email: session.user.email,
      action: 'UPDATE_NEWS',
      details: `Berita diperbarui (Mode Lokal): "${title}"`,
    });
  }

  revalidatePath('/berita');
  revalidatePath('/admin/berita');
  revalidatePath('/');
  if (updatedSlug) revalidatePath(`/berita/${updatedSlug}`);

  return { success: true };
}

export async function deleteNewsAction(id: string) {
  const session = await requireAdminSession();

  try {
    await connectToDatabase();
    await News.findByIdAndDelete(id);

    await recordAuditLog({
      email: session.user.email,
      action: 'DELETE_NEWS',
      details: `Menghapus berita dengan ID: ${id}`,
    });
  } catch {}

  const index = initialNews.findIndex((n) => n.id === id);
  if (index !== -1) initialNews.splice(index, 1);

  revalidatePath('/berita');
  revalidatePath('/admin/berita');
  revalidatePath('/');

  return { success: true };
}
