'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { Member } from '@/lib/models/Member';
import { recordAuditLog } from '@/lib/audit';
import { requireAdminSession } from '@/lib/auth';
import { convertGoogleDriveUrl } from '@/lib/imageUtils';

const initialMembers: any[] = [
  {
    id: 'mem-ketua',
    name: 'Salman Al Farisi',
    role: 'Ketua Chapter',
    division: 'Ketua Chapter',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop',
    bio: 'Memimpin & mengabdi untuk kemajuan dan senyuman generasi pemuda Tasikmalaya.',
    email: 'salman@santasikmalaya.org',
    instagram: '@salman_alfarisi',
    linkedin: 'salman-al-farisi',
    order: 1,
  },
  {
    id: 'mem-1',
    name: 'M. Wildan Febrian',
    role: 'Kepala Divisi PSDM',
    division: 'Divisi PSDM',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop',
    bio: 'Memfasilitasi pelatihan kepemimpinan & workshop skill anggota.',
    email: 'wildan@santasikmalaya.org',
    instagram: '@wildan_feb',
    linkedin: 'wildan-febrian',
    order: 2,
  },
  {
    id: 'mem-2',
    name: 'Siti Rahmawati',
    role: 'Staff Divisi PSDM',
    division: 'Divisi PSDM',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop',
    bio: 'Pengelola pendampingan kader dan kaderisasi anggota.',
    email: 'rahma@santasikmalaya.org',
    instagram: '@siti_rahma',
    linkedin: 'siti-rahmawati',
    order: 3,
  },
  {
    id: 'mem-3',
    name: 'Rian Hidayat',
    role: 'Kepala Divisi Kominfo',
    division: 'Divisi Kominfo',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop',
    bio: 'Kreator konten & pengelola strategi komunikasi publik San Tasik.',
    email: 'rian@santasikmalaya.org',
    instagram: '@rian_hidayat',
    linkedin: 'rian-hidayat',
    order: 4,
  },
  {
    id: 'mem-4',
    name: 'Nabila Putri',
    role: 'Staff Divisi Kominfo',
    division: 'Divisi Kominfo',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop',
    bio: 'Spesialis desainer grafis dan kurator media sosial.',
    email: 'nabila@santasikmalaya.org',
    instagram: '@nabila_ptr',
    linkedin: 'nabila-putri',
    order: 5,
  },
  {
    id: 'mem-5',
    name: 'Agus Setiawan',
    role: 'Kepala Divisi Rensos',
    division: 'Divisi Rensos',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop',
    bio: 'Koordinator aksi tanggap sosial dan bakti masyarakat Priangan.',
    email: 'agus@santasikmalaya.org',
    instagram: '@agus_setia',
    linkedin: 'agus-setiawan',
    order: 6,
  },
  {
    id: 'mem-6',
    name: 'Farhan Permana',
    role: 'Staff Divisi Rensos',
    division: 'Divisi Rensos',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop',
    bio: 'Pelaksana perencanaan program bakti sosial berkala.',
    email: 'farhan@santasikmalaya.org',
    instagram: '@farhan_perm',
    linkedin: 'farhan-permana',
    order: 7,
  },
  {
    id: 'mem-7',
    name: 'Dadan Hamdani',
    role: 'Steering Committee',
    division: 'Divisi SC',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop',
    bio: 'Pembina & pengarah strategis keorganisasian San Chapter Tasikmalaya.',
    email: 'dadan@santasikmalaya.org',
    instagram: '@dadan_hamdani',
    linkedin: 'dadan-hamdani',
    order: 8,
  },
];

export async function getMembersList(division?: string) {
  try {
    await connectToDatabase();
    const filter: any = {};
    if (division && division !== 'Semua') {
      filter.division = division;
    }

    const docs = await Member.find(filter).sort({ order: 1, createdAt: -1 }).lean();

    if (docs && docs.length > 0) {
      return docs.map((doc: any) => ({
        id: doc._id.toString(),
        name: doc.name,
        role: doc.role,
        division: doc.division,
        photoUrl: convertGoogleDriveUrl(doc.photoUrl) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        bio: doc.bio || '',
        email: doc.email || '',
        instagram: doc.instagram || '',
        linkedin: doc.linkedin || '',
        whatsapp: doc.whatsapp || '',
        imagePosition: doc.imagePosition || 'object-center',
        order: doc.order || 0,
      }));
    }
  } catch (err) {
    console.warn('DB error, using fallback members:', (err as Error).message);
  }

  let filtered = [...initialMembers];
  if (division && division !== 'Semua') {
    filtered = filtered.filter((m) => m.division.toLowerCase() === division.toLowerCase());
  }

  return filtered.map((item) => ({
    ...item,
    photoUrl: convertGoogleDriveUrl(item.photoUrl),
    imagePosition: (item as any).imagePosition || 'object-center',
  }));
}

export async function createMemberAction(formData: FormData) {
  const session = await requireAdminSession();
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;
  const division = (formData.get('division') as string) || 'Divisi PSDM';
  const photoUrlInput = (formData.get('photoUrl') as string) || '';
  const bio = formData.get('bio') as string;
  const email = (formData.get('email') as string) || '';
  const instagram = formData.get('instagram') as string;
  const linkedin = formData.get('linkedin') as string;
  const whatsapp = (formData.get('whatsapp') as string) || '';
  const imagePosition = (formData.get('imagePosition') as string) || 'object-center';

  if (!name || !role) {
    return { success: false, error: 'Nama dan jabatan/role wajib diisi.' };
  }

  const finalPhotoUrl = convertGoogleDriveUrl(photoUrlInput) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
  let createdId = 'mem-' + Date.now();

  try {
    await connectToDatabase();
    const newMember = await Member.create({
      name,
      role,
      division,
      photoUrl: finalPhotoUrl,
      bio,
      email,
      instagram,
      linkedin,
      whatsapp,
      imagePosition,
      order: 10,
    });
    createdId = newMember._id.toString();

    await recordAuditLog({
      email: session.user.email,
      action: 'ADD_MEMBER',
      details: `Menambahkan pengurus baru: "${name}" (${role})`,
    });
  } catch (err) {
    const mockMember = {
      id: createdId,
      name,
      role,
      division,
      photoUrl: finalPhotoUrl,
      bio,
      email,
      instagram,
      linkedin,
      whatsapp,
      imagePosition,
      order: 10,
    };
    initialMembers.push(mockMember);

    await recordAuditLog({
      email: session.user.email,
      action: 'ADD_MEMBER',
      details: `Menambahkan pengurus baru (Mode Lokal): "${name}" (${role})`,
    });
  }

  revalidatePath('/anggota');
  revalidatePath('/admin/anggota');

  return { success: true, id: createdId };
}

export async function updateMemberAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;
  const division = (formData.get('division') as string) || 'Divisi PSDM';
  const photoUrlInput = (formData.get('photoUrl') as string) || '';
  const bio = formData.get('bio') as string;
  const email = (formData.get('email') as string) || '';
  const instagram = formData.get('instagram') as string;
  const linkedin = formData.get('linkedin') as string;
  const whatsapp = (formData.get('whatsapp') as string) || '';
  const imagePosition = (formData.get('imagePosition') as string) || 'object-center';

  if (!id || !name || !role) {
    return { success: false, error: 'ID, Nama, dan Jabatan wajib diisi.' };
  }

  const finalPhotoUrl = convertGoogleDriveUrl(photoUrlInput) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';

  try {
    await connectToDatabase();
    await Member.findByIdAndUpdate(id, {
      name,
      role,
      division,
      photoUrl: finalPhotoUrl,
      bio,
      email,
      instagram,
      linkedin,
      whatsapp,
      imagePosition,
    });

    await recordAuditLog({
      email: session.user.email,
      action: 'UPDATE_MEMBER',
      details: `Memperbarui data pengurus: "${name}" (${role})`,
    });
  } catch (err) {
    const index = initialMembers.findIndex((m) => m.id === id);
    if (index !== -1) {
      initialMembers[index] = {
        ...initialMembers[index],
        name,
        role,
        division,
        photoUrl: finalPhotoUrl,
        bio,
        email,
        instagram,
        linkedin,
        whatsapp,
        imagePosition,
      };
    }
  }

  revalidatePath('/anggota');
  revalidatePath('/admin/anggota');

  return { success: true };
}

export async function deleteMemberAction(id: string) {
  const session = await requireAdminSession();

  try {
    await connectToDatabase();
    await Member.findByIdAndDelete(id);

    await recordAuditLog({
      email: session.user.email,
      action: 'DELETE_MEMBER',
      details: `Menghapus pengurus dengan ID: ${id}`,
    });
  } catch {}

  const index = initialMembers.findIndex((m) => m.id === id);
  if (index !== -1) initialMembers.splice(index, 1);

  revalidatePath('/anggota');
  revalidatePath('/admin/anggota');

  return { success: true };
}
