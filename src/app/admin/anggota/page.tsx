'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { Badge } from '@/components/ui/Badge';
import { getMembersList, createMemberAction, updateMemberAction, deleteMemberAction } from '@/app/actions/memberActions';
import Link from 'next/link';
import { Users, Plus, Trash2, ArrowLeft, Pencil } from 'lucide-react';

export default function AdminAnggotaPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [imagePos, setImagePos] = useState('object-center');

  const fetchMembers = async () => {
    setLoading(true);
    const data = await getMembersList();
    setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setPhotoUrlInput('');
    setImagePos('object-center');
    setShowModal(true);
  };

  const handleOpenEditModal = (member: any) => {
    setEditingMember(member);
    setPhotoUrlInput(member.photoUrl || '');
    setImagePos(member.imagePosition || 'object-center');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      let res;
      if (editingMember) {
        formData.append('id', editingMember.id);
        res = await updateMemberAction(formData);
      } else {
        res = await createMemberAction(formData);
      }

      if (res.success) {
        setShowModal(false);
        setEditingMember(null);
        fetchMembers();
      } else {
        alert(res.error || 'Gagal menyimpan data pengurus.');
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${name}" dari direktori pengurus?`)) {
      await deleteMemberAction(id);
      fetchMembers();
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin">
            <span className="text-xs font-black text-slate-600 hover:text-amber-600 flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Manajemen Pengurus Organisasi
          </h1>
        </div>

        <RetroButton
          variant="accent"
          size="md"
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Tambah Pengurus Baru
        </RetroButton>
      </div>

      {/* Modal Form Create / Edit Member */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 md:p-8 max-w-lg w-full space-y-4 shadow-[8px_8px_0px_0px_#000] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-500 shrink-0" />
                <span>{editingMember ? 'Edit Data Pengurus' : 'Form Tambah Pengurus'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full border-2 border-black bg-rose-200 text-black font-black hover:bg-rose-400 shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-black text-slate-950 mb-1 text-xs uppercase">Nama Lengkap:</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingMember?.name || ''}
                  placeholder="Misal: Ahmad Fauzi"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-950 mb-1 text-xs uppercase">Jabatan / Role:</label>
                  <input
                    type="text"
                    name="role"
                    required
                    defaultValue={editingMember?.role || ''}
                    placeholder="Ketua Chapter / Staff"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-950 mb-1 text-xs uppercase">Divisi:</label>
                  <select
                    name="division"
                    defaultValue={editingMember?.division || 'Divisi PSDM'}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Ketua Chapter" className="bg-white text-slate-950 font-bold">Ketua Chapter</option>
                    <option value="Divisi PSDM" className="bg-white text-slate-950 font-bold">Divisi PSDM</option>
                    <option value="Divisi Kominfo" className="bg-white text-slate-950 font-bold">Divisi Kominfo</option>
                    <option value="Divisi Rensos" className="bg-white text-slate-950 font-bold">Divisi Rensos</option>
                    <option value="Divisi SC" className="bg-white text-slate-950 font-bold">Divisi SC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-950 mb-1 text-xs uppercase">URL Foto Profil (Drive / Direct):</label>
                <input
                  type="text"
                  name="photoUrl"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://drive.google.com/... atau https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Live Square Preview & Face Position Controls */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/80 border-2 border-black">
                <label className="block font-black text-slate-950 text-xs uppercase">
                  Pratinjau Foto & Fokus Wajah (Smart Crop):
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border-2 border-black overflow-hidden shadow-[3px_3px_0px_0px_#000] bg-white shrink-0 relative">
                    <img
                      src={photoUrlInput || '/images/san-activity.jpg'}
                      alt="Preview Avatar"
                      className={`w-full h-full object-cover ${imagePos}`}
                      onError={(e) => {
                        e.currentTarget.src = '/images/san-activity.jpg';
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-slate-700 block">Pilih Fokus Avatar:</span>
                    <input type="hidden" name="imagePosition" value={imagePos} />
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Tengah', val: 'object-center' },
                        { label: 'Atas', val: 'object-top' },
                        { label: 'Bawah', val: 'object-bottom' },
                        { label: 'Kiri', val: 'object-left' },
                        { label: 'Kanan', val: 'object-right' },
                      ].map((pos) => (
                        <button
                          key={pos.val}
                          type="button"
                          onClick={() => setImagePos(pos.val)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-black border-2 transition-all ${
                            imagePos === pos.val
                              ? 'bg-amber-400 border-black shadow-[2px_2px_0px_0px_#000] text-slate-950'
                              : 'bg-white border-slate-300 hover:border-black text-slate-800'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-950 mb-1 text-xs uppercase">Email:</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingMember?.email || ''}
                    placeholder="email@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-950 mb-1 text-xs uppercase">Instagram:</label>
                  <input
                    type="text"
                    name="instagram"
                    defaultValue={editingMember?.instagram || ''}
                    placeholder="@username"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-950 mb-1 text-xs uppercase">WhatsApp:</label>
                  <input
                    type="text"
                    name="whatsapp"
                    defaultValue={editingMember?.whatsapp || ''}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-950 mb-1 text-xs uppercase">LinkedIn:</label>
                  <input
                    type="text"
                    name="linkedin"
                    defaultValue={editingMember?.linkedin || ''}
                    placeholder="username"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-950 mb-1 text-xs uppercase">Kutipan / Bio Singkat:</label>
                <input
                  type="text"
                  name="bio"
                  defaultValue={editingMember?.bio || ''}
                  placeholder="Kutipan semangat..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black font-extrabold bg-white text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                <RetroButton variant="outline" size="md" onClick={() => setShowModal(false)} className="w-full sm:w-auto justify-center">
                  Batal
                </RetroButton>
                <RetroButton variant="accent" size="md" type="submit" disabled={submitting} className="w-full sm:w-auto justify-center">
                  {submitting ? 'Menyimpan...' : editingMember ? 'Simpan Perubahan' : 'Simpan Pengurus'}
                </RetroButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Directory List */}
      <RetroCard badgeBg="bg-white" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-slate-200 pb-3">
          <h3 className="text-lg sm:text-xl font-black text-slate-950">
            Daftar Pengurus ({members.length})
          </h3>
          <Badge variant="blue" className="text-xs">MongoDB Member Collection</Badge>
        </div>

        {loading ? (
          <p className="text-center py-8 font-bold text-slate-600">Memuat pengurus...</p>
        ) : members.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000]">
              <Users className="w-6 h-6 text-slate-950" />
            </div>
            <h4 className="font-black text-slate-950 text-base">Belum Ada Data Pengurus</h4>
            <p className="text-xs font-bold text-slate-600 max-w-sm mx-auto">
              Silakan klik tombol &quot;Tambah Pengurus Baru&quot; di atas untuk menambahkan pengurus pertama.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-amber-50 border-2 border-black flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className={`w-14 h-14 rounded-2xl border-2 border-black object-cover shrink-0 ${member.imagePosition || 'object-center'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <Badge variant="yellow" className="text-[10px] py-0.5 px-2 mb-0.5">{member.division}</Badge>
                    <h4 className="font-black text-slate-950 text-sm sm:text-base truncate">{member.name}</h4>
                    <p className="text-xs font-bold text-amber-700 truncate">{member.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(member)}
                    className="p-2 rounded-xl bg-amber-300 border-2 border-black text-slate-950 font-black text-xs hover:bg-amber-400"
                    title="Edit Pengurus"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    className="p-2 rounded-xl bg-rose-200 border-2 border-black text-rose-950 font-black text-xs hover:bg-rose-400"
                    title="Hapus Pengurus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </RetroCard>
    </div>
  );
}
