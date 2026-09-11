'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { Settings } from '@/lib/models/Settings';
import { recordAuditLog } from '@/lib/audit';
import { requireAdminSession } from '@/lib/auth';

const DEFAULT_SETTINGS = {
  instagramUrl: 'https://www.instagram.com/san.tasikmalaya.2020/',
  youtubeUrl: 'https://www.youtube.com/@sanchaptertasikmalaya3661',
  whatsappNumber: '081234567890',
  email: 'san.tasikmalaya.2020@gmail.com',
};

export async function getSiteSettings() {
  try {
    await connectToDatabase();
    const doc = await Settings.findOne({ key: 'site_settings' }).lean();
    if (doc) {
      return {
        instagramUrl: (doc as any).instagramUrl || DEFAULT_SETTINGS.instagramUrl,
        youtubeUrl: (doc as any).youtubeUrl || DEFAULT_SETTINGS.youtubeUrl,
        whatsappNumber: (doc as any).whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
        email: (doc as any).email || DEFAULT_SETTINGS.email,
      };
    }
  } catch (err) {
    console.warn('DB settings fallback:', (err as Error).message);
  }

  return DEFAULT_SETTINGS;
}

export async function updateSiteSettingsAction(formData: FormData) {
  const session = await requireAdminSession();
  const instagramUrl = (formData.get('instagramUrl') as string) || DEFAULT_SETTINGS.instagramUrl;
  const youtubeUrl = (formData.get('youtubeUrl') as string) || DEFAULT_SETTINGS.youtubeUrl;
  const whatsappNumber = (formData.get('whatsappNumber') as string) || DEFAULT_SETTINGS.whatsappNumber;
  const email = (formData.get('email') as string) || DEFAULT_SETTINGS.email;

  try {
    await connectToDatabase();
    await Settings.findOneAndUpdate(
      { key: 'site_settings' },
      { instagramUrl, youtubeUrl, whatsappNumber, email },
      { upsert: true, new: true }
    );

    await recordAuditLog({
      email: session.user.email,
      action: 'UPDATE_SETTINGS',
      details: `Memperbarui tautan jejaring sosial & info kontak resmi`,
    });
  } catch (err) {
    console.warn('Settings update DB fallback:', (err as Error).message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/settings');

  return { success: true };
}
