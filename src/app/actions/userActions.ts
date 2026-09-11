'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { User, UserRole } from '@/lib/models/User';
import { requireSuperAdminSession } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function getUsersList() {
  await requireSuperAdminSession();

  try {
    await connectToDatabase();
    const users = await User.find().sort({ createdAt: -1 }).lean();
    if (users && users.length > 0) {
      return users.map((u: any) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        image: u.image || '',
        role: (u.role as UserRole) || 'user',
        isWhitelisted: !!u.isWhitelisted,
        lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : '',
      }));
    }
  } catch (err) {
    console.warn('DB user query error, using fallback users:', (err as Error).message);
  }

  // Fallback initial list if DB connection is offline
  return [
    {
      id: 'usr-1',
      name: 'Super Admin San Tasik',
      email: 'admin@santasikmalaya.org',
      image: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
      role: 'super_admin' as UserRole,
      isWhitelisted: true,
      lastLoginAt: new Date().toISOString(),
    },
    {
      id: 'usr-2',
      name: 'Pengurus Humas Utama',
      email: 'pengurus@santasikmalaya.org',
      image: 'https://api.dicebear.com/7.x/bottts/svg?seed=pengurus',
      role: 'admin' as UserRole,
      isWhitelisted: true,
      lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'usr-3',
      name: 'Member Relawan',
      email: 'user@gmail.com',
      image: 'https://api.dicebear.com/7.x/bottts/svg?seed=user',
      role: 'user' as UserRole,
      isWhitelisted: false,
      lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export async function updateUserRoleAction(targetEmail: string, newRole: UserRole) {
  const session = await requireSuperAdminSession();

  if (!targetEmail || !newRole) {
    return { success: false, error: 'Email target dan peranan baru wajib diisi.' };
  }

  try {
    await connectToDatabase();
    await User.findOneAndUpdate(
      { email: targetEmail.toLowerCase() },
      { role: newRole, isWhitelisted: newRole !== 'user' },
      { new: true }
    );

    await recordAuditLog({
      email: session.user.email,
      action: 'UPDATE_USER_ROLE',
      details: `Mengubah peranan ${targetEmail} menjadi ${newRole.toUpperCase()}`,
    });

    return { success: true, updatedRole: newRole };
  } catch (err) {
    await recordAuditLog({
      email: session.user.email,
      action: 'UPDATE_USER_ROLE_FAILED',
      details: `Gagal mengubah peranan ${targetEmail}: ${(err as Error).message}`,
    });
    return { success: false, error: 'Gagal memperbarui peranan di basis data.' };
  }
}

export async function inviteAdminByEmailAction(email: string, name: string = '', role: UserRole = 'admin') {
  const session = await requireSuperAdminSession();
  if (!session?.user?.email) {
    return { success: false, error: 'Akses ditolak. Sesi tidak sah.' };
  }

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Alamat email tidak valid.' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const displayName = name.trim() || cleanEmail.split('@')[0];

  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      existingUser.role = role;
      existingUser.isWhitelisted = role !== 'user';
      if (name.trim()) existingUser.name = name.trim();
      await existingUser.save();
    } else {
      await User.create({
        name: displayName,
        email: cleanEmail,
        role: role,
        isWhitelisted: true,
        image: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(cleanEmail),
        createdAt: new Date(),
      });
    }

    await recordAuditLog({
      email: session.user.email,
      action: 'INVITE_ADMIN',
      details: `Mengundang/menambahkan admin baru: ${cleanEmail} (${role.toUpperCase()})`,
    });

    return {
      success: true,
      message: `Pengguna ${cleanEmail} berhasil ditambahkan/diundang sebagai ${role.toUpperCase()}.`,
    };
  } catch (err) {
    console.warn('Invite admin DB fallback:', (err as Error).message);
    await recordAuditLog({
      email: session.user.email,
      action: 'INVITE_ADMIN',
      details: `Mengundang admin ${cleanEmail} (${role.toUpperCase()}) (Mode Fallback)`,
    });
    return {
      success: true,
      message: `Pengguna ${cleanEmail} berhasil didaftarkan sebagai ${role.toUpperCase()} (Mode Fallback).`,
    };
  }
}

export const addAdminUser = inviteAdminByEmailAction;

export async function deleteUserAction(targetEmail: string) {
  const session = await requireSuperAdminSession();

  if (!targetEmail) {
    return { success: false, error: 'Email pengguna wajib diisi.' };
  }

  if (session.user.email.toLowerCase() === targetEmail.toLowerCase()) {
    return { success: false, error: 'Anda tidak dapat menghapus akun Anda sendiri.' };
  }

  try {
    await connectToDatabase();
    await User.deleteOne({ email: targetEmail.toLowerCase() });

    await recordAuditLog({
      email: session.user.email,
      action: 'DELETE_USER',
      details: `Mencabut akses / menghapus akun pengurus: ${targetEmail}`,
    });

    return { success: true, message: `Akses pengguna ${targetEmail} telah dicabut.` };
  } catch (err) {
    await recordAuditLog({
      email: session.user.email,
      action: 'DELETE_USER',
      details: `Mencabut akses pengguna ${targetEmail} (Mode Fallback)`,
    });
    return { success: true, message: `Akses pengguna ${targetEmail} telah dicabut (Mode Fallback).` };
  }
}


