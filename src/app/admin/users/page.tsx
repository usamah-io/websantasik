'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { Badge } from '@/components/ui/Badge';
import { getUsersList, updateUserRoleAction, inviteAdminByEmailAction, deleteUserAction } from '@/app/actions/userActions';
import Link from 'next/link';
import { UserCheck, ArrowLeft, Shield, UserPlus, Mail, CheckCircle2, User as UserIcon, Trash2, ShieldAlert } from 'lucide-react';
import { UserRole } from '@/lib/models/User';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);

  // Form Invite Admin State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('admin');
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsersList();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (email: string, newRole: UserRole) => {
    if (confirm(`Ubah peranan ${email} menjadi "${newRole.toUpperCase()}"?`)) {
      setUpdatingEmail(email);
      try {
        const res = await updateUserRoleAction(email, newRole);
        if (res.success) {
          fetchUsers();
        } else {
          alert(res.error || 'Gagal mengubah peranan.');
        }
      } catch (err) {
        alert((err as Error).message);
      } finally {
        setUpdatingEmail(null);
      }
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (confirm(`Cabut hak akses admin dan hapus pengguna "${email}"?`)) {
      setUpdatingEmail(email);
      try {
        const res = await deleteUserAction(email);
        if (res.success) {
          fetchUsers();
        } else {
          alert(res.error || 'Gagal mencabut akses admin.');
        }
      } catch (err) {
        alert((err as Error).message);
      } finally {
        setUpdatingEmail(null);
      }
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    setInviteMessage(null);

    try {
      const res = await inviteAdminByEmailAction(inviteEmail, inviteName, inviteRole);
      if (res.success) {
        setInviteMessage({ type: 'success', text: res.message || 'Admin berhasil ditambahkan!' });
        setInviteEmail('');
        setInviteName('');
        fetchUsers();
      } else {
        setInviteMessage({ type: 'error', text: res.error || 'Gagal mengundang admin.' });
      }
    } catch (err) {
      setInviteMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin">
            <span className="text-xs font-black text-slate-950 hover:text-amber-600 flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard Admin
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Manajemen Peranan & Hak Akses (RBAC)
            </h1>
            <Badge variant="purple" className="text-slate-950 font-black text-xs">
              SUPER ADMIN ONLY
            </Badge>
          </div>
        </div>
      </div>

      {/* Invite / Add Admin by Email Section */}
      <RetroCard badgeBg="bg-amber-300" className="p-5 sm:p-7 space-y-4 border-4 shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center gap-2.5 border-b-2 border-black pb-3">
          <div className="w-10 h-10 rounded-2xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
            <UserPlus className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Undang / Tambah Admin Baru</h2>
            <p className="text-xs font-black text-slate-950">
              Daftarkan email pengurus untuk memberikan hak akses Admin (Editor) atau Super Admin secara langsung.
            </p>
          </div>
        </div>

        {inviteMessage && (
          <div
            className={`p-3 rounded-2xl border-2 border-black text-xs font-black flex items-center gap-2 ${
              inviteMessage.type === 'success' ? 'bg-emerald-200 text-slate-950' : 'bg-rose-200 text-slate-950'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{inviteMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleInviteSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs sm:text-sm">
          <div className="sm:col-span-5">
            <label className="block font-black text-slate-950 mb-1 uppercase text-[11px]">Email Pengurus:</label>
            <div className="relative">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="pengurus@gmail.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-2 border-black font-black bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <Mail className="w-4 h-4 text-slate-950 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block font-black text-slate-950 mb-1 uppercase text-[11px]">Nama Lengkap (Opsional):</label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Misal: Ahmad Zaky"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-black bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block font-black text-slate-950 mb-1 uppercase text-[11px]">Peranan (Role):</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              style={{ color: '#000000', backgroundColor: '#ffffff', colorScheme: 'light' }}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-black font-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="admin" style={{ color: '#000000', backgroundColor: '#ffffff' }} className="font-black text-black bg-white">ADMIN (Editor)</option>
              <option value="super_admin" style={{ color: '#000000', backgroundColor: '#ffffff' }} className="font-black text-black bg-white">SUPER ADMIN (Full Access)</option>
            </select>
          </div>

          <div className="sm:col-span-12 flex justify-end pt-1">
            <RetroButton
              variant="accent"
              size="md"
              type="submit"
              disabled={inviting}
              className="w-full sm:w-auto justify-center font-black"
            >
              <UserPlus className="w-4 h-4 text-slate-950 shrink-0" />
              <span>{inviting ? 'Proses Pendaftaran...' : '+ Undang / Tambah Admin Baru'}</span>
            </RetroButton>
          </div>
        </form>
      </RetroCard>

      {/* Role Permission Matrix Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RetroCard badgeBg="bg-purple-100" className="p-5 space-y-2 border-3">
          <div className="flex items-center gap-2">
            <span
              style={{ color: '#000000', backgroundColor: '#d8b4fe' }}
              className="inline-flex items-center px-3 py-1 text-xs font-black rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] uppercase tracking-wider text-black bg-purple-300"
            >
              SUPER ADMIN
            </span>
            <span style={{ color: '#000000' }} className="font-black text-black text-sm">Akses Penuh (Full System Access)</span>
          </div>
          <p style={{ color: '#020617' }} className="text-xs font-extrabold text-slate-950 leading-relaxed">
            Dapat mengelola peranan pengurus lain, mengundang admin baru, mencabut akses admin, mengubah pengaturan jejaring sosial, dan melihat audit log keamanan.
          </p>
        </RetroCard>

        <RetroCard badgeBg="bg-emerald-100" className="p-5 space-y-2 border-3">
          <div className="flex items-center gap-2">
            <span
              style={{ color: '#000000', backgroundColor: '#6ee7b7' }}
              className="inline-flex items-center px-3 py-1 text-xs font-black rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] uppercase tracking-wider text-black bg-emerald-300"
            >
              ADMIN / EDITOR
            </span>
            <span style={{ color: '#000000' }} className="font-black text-black text-sm">Manajemen Konten & Warta</span>
          </div>
          <p style={{ color: '#020617' }} className="text-xs font-extrabold text-slate-950 leading-relaxed">
            Dapat menulis/mengedit berita, mengunggah dokumentasi galeri kegiatan, dan memperbarui profil direktori pengurus organisasi.
          </p>
        </RetroCard>
      </div>

      {/* Users List (Responsive Card View for Mobile & Sticky Action Table for Desktop) */}
      <RetroCard badgeBg="bg-white" className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <h3 style={{ color: '#000000' }} className="text-lg sm:text-xl font-black text-black">
            Daftar Pengguna & Admin Terdaftar ({users.length})
          </h3>
          <span
            style={{ color: '#000000', backgroundColor: '#fde047' }}
            className="inline-flex items-center px-2.5 py-0.5 text-xs font-black rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000] uppercase text-black bg-yellow-300"
          >
            MongoDB User Collection
          </span>
        </div>

        {loading ? (
          <p style={{ color: '#000000' }} className="text-center py-8 font-black text-black">Memuat daftar pengguna...</p>
        ) : (
          <>
            {/* Desktop View Table with Sticky Action Column */}
            <div className="hidden md:block overflow-x-auto relative rounded-2xl border-2 border-black">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-amber-300 font-black uppercase tracking-wider">
                    <th className="p-3.5 border-r border-slate-800">Pengguna</th>
                    <th className="p-3.5 border-r border-slate-800">Email</th>
                    <th className="p-3.5 border-r border-slate-800">Peranan (Role)</th>
                    <th className="p-3.5 border-r border-slate-800">Login Terakhir</th>
                    <th className="p-3.5 text-center sticky right-0 bg-slate-950 text-amber-300 z-10 border-l-2 border-slate-800 shadow-[-4px_0px_8px_rgba(0,0,0,0.15)]">
                      Aksi & Peranan (RBAC)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t-2 border-black font-black text-slate-950">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-amber-50/80 transition-colors">
                      <td className="p-3.5 border-r border-slate-200 flex items-center gap-2.5">
                        <img
                          src={u.image || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.email}
                          alt={u.name}
                          className="w-9 h-9 rounded-full border-2 border-black shrink-0"
                        />
                        <span style={{ color: '#000000' }} className="font-black text-black text-sm truncate max-w-[160px]">{u.name}</span>
                      </td>
                      <td style={{ color: '#000000' }} className="p-3.5 border-r border-slate-200 font-mono font-black text-black">{u.email}</td>
                      <td className="p-3.5 border-r border-slate-200">
                        {u.role === 'super_admin' ? (
                          <span
                            style={{ color: '#000000', backgroundColor: '#d8b4fe' }}
                            className="inline-flex items-center px-3 py-1 text-xs font-black rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] tracking-wider text-black uppercase"
                          >
                            SUPER ADMIN
                          </span>
                        ) : u.role === 'admin' ? (
                          <span
                            style={{ color: '#000000', backgroundColor: '#6ee7b7' }}
                            className="inline-flex items-center px-3 py-1 text-xs font-black rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] tracking-wider text-black uppercase"
                          >
                            ADMIN (EDITOR)
                          </span>
                        ) : (
                          <span
                            style={{ color: '#000000', backgroundColor: '#fde047' }}
                            className="inline-flex items-center px-3 py-1 text-xs font-black rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] tracking-wider text-black uppercase"
                          >
                            USER
                          </span>
                        )}
                      </td>
                      <td style={{ color: '#000000' }} className="p-3.5 border-r border-slate-200 font-mono font-extrabold text-black">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('id-ID') : '-'}
                      </td>
                      {/* Sticky Right Action Column */}
                      <td className="p-3.5 sticky right-0 bg-white border-l-2 border-black z-10 shadow-[-4px_0px_8px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            disabled={updatingEmail === u.email}
                            onClick={() => handleRoleChange(u.email, 'super_admin')}
                            style={{ color: '#000000' }}
                            className={`px-2.5 py-1.5 rounded-lg border-2 text-[11px] font-black transition-all ${
                              u.role === 'super_admin'
                                ? 'bg-purple-300 border-black text-black shadow-[1.5px_1.5px_0px_0px_#000]'
                                : 'bg-white border-slate-400 text-black hover:border-black hover:bg-slate-100'
                            }`}
                          >
                            Super Admin
                          </button>
                          <button
                            disabled={updatingEmail === u.email}
                            onClick={() => handleRoleChange(u.email, 'admin')}
                            style={{ color: '#000000' }}
                            className={`px-2.5 py-1.5 rounded-lg border-2 text-[11px] font-black transition-all ${
                              u.role === 'admin'
                                ? 'bg-emerald-300 border-black text-black shadow-[1.5px_1.5px_0px_0px_#000]'
                                : 'bg-white border-slate-400 text-black hover:border-black hover:bg-slate-100'
                            }`}
                          >
                            Admin
                          </button>
                          <button
                            disabled={updatingEmail === u.email}
                            onClick={() => handleRoleChange(u.email, 'user')}
                            style={{ color: '#000000' }}
                            className={`px-2.5 py-1.5 rounded-lg border-2 text-[11px] font-black transition-all ${
                              u.role === 'user'
                                ? 'bg-amber-300 border-black text-black shadow-[1.5px_1.5px_0px_0px_#000]'
                                : 'bg-white border-slate-400 text-black hover:border-black hover:bg-slate-100'
                            }`}
                          >
                            User
                          </button>
                          <button
                            disabled={updatingEmail === u.email}
                            onClick={() => handleDeleteUser(u.email)}
                            style={{ color: '#881337' }}
                            className="p-1.5 rounded-lg bg-rose-200 hover:bg-rose-400 border border-black text-rose-950 font-black transition-all ml-1"
                            title="Cabut Akses / Hapus Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Responsive Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-amber-50/80 border-2 border-black space-y-3 shadow-[3px_3px_0px_0px_#000]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={u.image || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.email}
                        alt={u.name}
                        className="w-10 h-10 rounded-full border-2 border-black shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 style={{ color: '#000000' }} className="font-black text-black text-sm truncate">{u.name}</h4>
                        <p style={{ color: '#000000' }} className="text-xs font-mono font-black text-black truncate">{u.email}</p>
                      </div>
                    </div>
                    {u.role === 'super_admin' ? (
                      <span
                        style={{ color: '#000000', backgroundColor: '#d8b4fe' }}
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000] text-black shrink-0 uppercase"
                      >
                        SUPER ADMIN
                      </span>
                    ) : u.role === 'admin' ? (
                      <span
                        style={{ color: '#000000', backgroundColor: '#6ee7b7' }}
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000] text-black shrink-0 uppercase"
                      >
                        ADMIN
                      </span>
                    ) : (
                      <span
                        style={{ color: '#000000', backgroundColor: '#fde047' }}
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000] text-black shrink-0 uppercase"
                      >
                        USER
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-amber-200/80 space-y-2">
                    <span style={{ color: '#000000' }} className="text-[11px] font-black text-black uppercase block">
                      Aksi & Peranan (RBAC):
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        disabled={updatingEmail === u.email}
                        onClick={() => handleRoleChange(u.email, 'super_admin')}
                        style={{ color: '#000000' }}
                        className={`py-1.5 rounded-xl border-2 text-[11px] font-black transition-all text-center ${
                          u.role === 'super_admin'
                            ? 'bg-purple-300 border-black text-black shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white border-slate-400 text-black hover:border-black'
                        }`}
                      >
                        Super Admin
                      </button>
                      <button
                        disabled={updatingEmail === u.email}
                        onClick={() => handleRoleChange(u.email, 'admin')}
                        style={{ color: '#000000' }}
                        className={`py-1.5 rounded-xl border-2 text-[11px] font-black transition-all text-center ${
                          u.role === 'admin'
                            ? 'bg-emerald-300 border-black text-black shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white border-slate-400 text-black hover:border-black'
                        }`}
                      >
                        Admin
                      </button>
                      <button
                        disabled={updatingEmail === u.email}
                        onClick={() => handleRoleChange(u.email, 'user')}
                        style={{ color: '#000000' }}
                        className={`py-1.5 rounded-xl border-2 text-[11px] font-black transition-all text-center ${
                          u.role === 'user'
                            ? 'bg-amber-300 border-black text-black shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white border-slate-400 text-black hover:border-black'
                        }`}
                      >
                        User
                      </button>
                    </div>
                    <div className="pt-1">
                      <button
                        disabled={updatingEmail === u.email}
                        onClick={() => handleDeleteUser(u.email)}
                        style={{ color: '#881337' }}
                        className="w-full py-2 rounded-xl bg-rose-200 border-2 border-black text-rose-950 font-black text-xs hover:bg-rose-400 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Cabut Akses Admin / Hapus User
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </RetroCard>
    </div>
  );
}


