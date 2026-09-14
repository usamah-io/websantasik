'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { Member } from '@/lib/models/Member';
import { recordAuditLog } from '@/lib/audit';
import { requireAdminSession } from '@/lib/auth';
import { convertGoogleDriveUrl } from '@/lib/imageUtils';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

const FALLBACK_PHOTO_URL = '/images/san-activity.jpg';
const DUMMY_MEMBER_NAMES = [
  'Salman Al Farisi',
  'M. Wildan Febrian',
  'Siti Rahmawati',
  'Rian Hidayat',
  'Nabila Putri',
  'Agus Setiawan',
  'Farhan Permana',
  'Dadan Hamdani',
];

const initialMembers: any[] = [];

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
        photoUrl: convertGoogleDriveUrl(doc.photoUrl) || FALLBACK_PHOTO_URL,
        bio: doc.bio || '',
        email: doc.email || '',
        instagram: doc.instagram || '',
        linkedin: doc.linkedin || '',
        whatsapp: doc.whatsapp || '',
        imagePosition: doc.imagePosition || 'object-center',
        order: doc.order || 0,
      }));
    }

    return [];
  } catch (err) {
    console.warn('DB error in getMembersList:', (err as Error).message);
    return [];
  }
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

  const imageFile = formData.get('image') as File | null;
  let finalPhotoUrl = FALLBACK_PHOTO_URL;

  if (imageFile && imageFile.size > 0 && imageFile.name) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    finalPhotoUrl = await uploadImageToCloudinary(buffer, imageFile.name);
  } else if (photoUrlInput && photoUrlInput.trim() !== '') {
    finalPhotoUrl = convertGoogleDriveUrl(photoUrlInput);
  }

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

  revalidatePath('/');
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

  const imageFile = formData.get('image') as File | null;
  let finalPhotoUrl = photoUrlInput && photoUrlInput.trim() !== '' ? convertGoogleDriveUrl(photoUrlInput) : undefined;

  if (imageFile && imageFile.size > 0 && imageFile.name) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    finalPhotoUrl = await uploadImageToCloudinary(buffer, imageFile.name);
  }

  try {
    await connectToDatabase();
    const updateData: any = {
      name,
      role,
      division,
      bio,
      email,
      instagram,
      linkedin,
      whatsapp,
      imagePosition,
    };
    if (finalPhotoUrl) {
      updateData.photoUrl = finalPhotoUrl;
    }

    await Member.findByIdAndUpdate(id, updateData);

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
        ...(finalPhotoUrl ? { photoUrl: finalPhotoUrl } : {}),
        bio,
        email,
        instagram,
        linkedin,
        whatsapp,
        imagePosition,
      };
    }
  }

  revalidatePath('/');
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

  revalidatePath('/');
  revalidatePath('/anggota');
  revalidatePath('/admin/anggota');

  return { success: true };
}
