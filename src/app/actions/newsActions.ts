'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { News } from '@/lib/models/News';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { recordAuditLog } from '@/lib/audit';
import { requireAdminSession } from '@/lib/auth';
import { convertGoogleDriveUrl } from '@/lib/imageUtils';

const initialNews = [
  {
    id: 'news-1',
    title: 'Festival Seni & Budaya San Tasikmalaya 2026 Segera Digelar!',
    slug: 'festival-seni-budaya-san-tasikmalaya-2026',
    summary: 'Ajang selebrasi kreativitas pemuda dan kebudayaan lokal Tasikmalaya menghadirkan musisi lokal dan pertunjukan teater.',
    content: `Festival Seni & Budaya San Tasikmalaya 2026 siap digelar bulan depan! Acara tahunan ini bertujuan melestarikan seni khas Priangan Timur sekaligus wadah berekspresi bagi generasi muda Tasikmalaya.\n\nDalam acara ini akan disajikan pameran kerajinan rajapolah, pentas tari kliningan, live painting, hingga bazar UMKM kuliner legendaris Nasi Tutug Oncom.`,
    category: 'Kegiatan',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop',
    ],
    author: 'Humas San Tasik',
    views: 432,
    createdAt: new Date('2026-08-15').toISOString(),
  },
  {
    id: 'news-2',
    title: 'Musyawarah Anggota & Pemilihan Ketua Umum Periode 2026-2028',
    slug: 'musyawarah-anggota-pemilihan-ketua-umum',
    summary: 'Proses demokrasi organisasi berjalan khidmat dengan semangat kekeluargaan dan gotong royong.',
    content: `San Tasikmalaya sukses menggelar Musyawarah Anggota untuk mengevaluasi laporan pertanggungjawaban kepengurusan lalu serta merumuskan garis besar haluan organisasi untuk dua tahun mendatang.\n\nSelamat kepada kepengurusan baru yang terpilih, mari bergerak bersama memajukan daerah!`,
    category: 'Organisasi',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop',
    ],
    author: 'Sekretariat',
    views: 289,
    createdAt: new Date('2026-08-28').toISOString(),
  },
  {
    id: 'news-3',
    title: 'Aksi Sosialisasi Kebersihan Lingkungan & Penanaman Pohon di Gunung Galunggung',
    slug: 'aksi-kebersihan-penanaman-pohon-galunggung',
    summary: 'Kolaborasi komunitas kepemudaan Tasikmalaya menjaga kelestarian alam dan ekosistem hijau.',
    content: `Sebanyak 50 relawan San Tasikmalaya turun langsung melakukan penanaman bibit pohon endemik di kaki Gunung Galunggung. Kegiatan ini diiringi edukasi pemilahan sampah organik dan anorganik kepada wisatawan lokal.`,
    category: 'Sosial',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop',
    ],
    author: 'Divisi Lingkungan',
    views: 195,
    createdAt: new Date('2026-09-02').toISOString(),
  },
];

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
        imageUrl: convertGoogleDriveUrl(doc.imageUrl) || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
        images: Array.isArray(doc.images)
          ? doc.images.map((url: string) => convertGoogleDriveUrl(url)).filter(Boolean)
          : [],
        author: doc.author,
        views: doc.views,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (e) {
    console.warn('DB query error in getNewsList, fallback to mock data:', (e as Error).message);
  }

  let filtered = [...initialNews];
  if (category && category !== 'Semua') {
    filtered = filtered.filter((n) => n.category.toLowerCase() === category.toLowerCase());
  }
  if (query && query.trim() !== '') {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (n) => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)
    );
  }

  return filtered.map((item) => ({
    ...item,
    imageUrl: convertGoogleDriveUrl(item.imageUrl),
    images: (item.images || []).map((url) => convertGoogleDriveUrl(url)).filter(Boolean),
  }));
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
        imageUrl: convertGoogleDriveUrl(doc.imageUrl) || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
        images: Array.isArray(doc.images)
          ? doc.images.map((url: string) => convertGoogleDriveUrl(url)).filter(Boolean)
          : [],
        author: doc.author,
        views: doc.views,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (e) {
    console.warn('DB query error in getLatestNews, fallback to mock data:', (e as Error).message);
  }

  return initialNews.slice(0, limit).map((item) => ({
    ...item,
    imageUrl: convertGoogleDriveUrl(item.imageUrl),
    images: (item.images || []).map((url) => convertGoogleDriveUrl(url)).filter(Boolean),
  }));
}

export async function getNewsBySlug(slug: string) {
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
        imageUrl: convertGoogleDriveUrl((doc as any).imageUrl) || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
        images: Array.isArray((doc as any).images)
          ? (doc as any).images.map((url: string) => convertGoogleDriveUrl(url)).filter(Boolean)
          : [],
        author: (doc as any).author,
        views: (doc as any).views,
        createdAt: (doc as any).createdAt ? new Date((doc as any).createdAt).toISOString() : new Date().toISOString(),
      };
    }
  } catch {}

  const found = initialNews.find((n) => n.slug === slug);
  if (found) {
    found.views += 1;
    return {
      ...found,
      imageUrl: convertGoogleDriveUrl(found.imageUrl),
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

  let finalImageUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop';

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
