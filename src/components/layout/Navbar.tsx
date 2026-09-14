'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { RetroButton } from '../ui/RetroButton';
import {
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  LogIn,
  ChevronDown,
  LayoutDashboard,
  Home,
  ArrowRight,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userRole = (session?.user as any)?.role || 'user';
  const isAdmin = userRole === 'super_admin' || userRole === 'admin';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on page navigation
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const publicNavLinks = [
    { name: 'Berita', href: '/berita', icon: FileText },
    { name: 'Anggota', href: '/anggota', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-amber-50 border-b-3 border-black py-3 px-4 md:px-8 shadow-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5 sm:gap-3">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center overflow-hidden p-0.5 shrink-0"
          >
            <img
              src="/logo.png"
              alt="San Chapter Tasikmalaya Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base md:text-xl tracking-tight text-slate-950 flex items-center gap-1 group-hover:text-amber-600 transition-colors">
              SAN CHAPTER TASIKMALAYA
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-700">
              Senyum Anak Nusantara
            </span>
          </div>
        </Link>

        {/* Desktop Public Nav Links Only */}
        <nav className="hidden md:flex items-center gap-2">
          {publicNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-extrabold border-2 transition-all ${
                    isActive
                      ? 'bg-amber-400 border-black shadow-[3px_3px_0px_0px_#000] text-slate-950'
                      : 'bg-white/80 border-transparent hover:border-black hover:bg-white text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-950" />
                  {link.name}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Auth Control (Login if unauthenticated, Elegant Profile Dropdown if logged in) */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 bg-white pl-2 pr-3 py-1.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-amber-100 transition-all cursor-pointer select-none"
              >
                <div className="relative">
                  <img
                    src={session.user?.image || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + session.user?.email}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full border border-black object-cover"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black ${
                      isAdmin ? 'bg-purple-500' : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <div className="flex flex-col text-left max-w-[120px]">
                  <span className="text-xs font-black text-slate-950 truncate leading-tight">
                    {session.user?.name || session.user?.email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-600 truncate leading-tight">
                    {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-700 transition-transform ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] p-2 space-y-1.5 z-50 overflow-hidden"
                  >
                    {/* User Info Card */}
                    <div className="p-3 bg-amber-50 rounded-xl border-2 border-black space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-950 truncate max-w-[130px]">
                          {session.user?.name || 'Pengguna'}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full border border-black font-black uppercase whitespace-nowrap ${
                            userRole === 'super_admin'
                              ? 'bg-purple-200 text-purple-950'
                              : userRole === 'admin'
                              ? 'bg-emerald-200 text-emerald-950'
                              : 'bg-amber-200 text-amber-950'
                          }`}
                        >
                          {userRole === 'super_admin' ? 'SUPER ADMIN' : userRole === 'admin' ? 'ADMIN' : 'MEMBER'}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono font-bold text-slate-600 truncate" title={session.user?.email || ''}>
                        {session.user?.email}
                      </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-0.5 pt-1">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-between p-2 rounded-xl bg-cyan-100 hover:bg-cyan-200 border-2 border-black text-xs font-black text-slate-950 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4 text-cyan-800" />
                            <span>Dashboard Admin</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
                        </Link>
                      )}

                      <Link
                        href="/"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors"
                      >
                        <Home className="w-4 h-4 text-slate-700" />
                        <span>Beranda Utama</span>
                      </Link>

                      <Link
                        href="/berita"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-slate-700" />
                        <span>Berita & Kegiatan</span>
                      </Link>

                      <Link
                        href="/anggota"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors"
                      >
                        <Users className="w-4 h-4 text-slate-700" />
                        <span>Jajaran Pengurus</span>
                      </Link>
                    </div>

                    {/* Logout Action */}
                    <div className="pt-1 border-t-2 border-slate-200">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-rose-100 hover:bg-rose-200 border-2 border-black text-xs font-black text-rose-950 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-800" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login">
              <RetroButton variant="primary" size="sm">
                <LogIn className="w-3.5 h-3.5" /> Masuk
              </RetroButton>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl border-2 border-black bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_#000]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-3 pt-3 border-t-2 border-black flex flex-col gap-2 overflow-hidden"
          >
            {publicNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white border-2 border-black font-black text-sm text-slate-950 shadow-[2px_2px_0px_0px_#000]"
                >
                  <Icon className="w-4 h-4 text-slate-950" />
                  {link.name}
                </Link>
              );
            })}

            {session ? (
              <div className="pt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <img
                    src={session.user?.image || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + session.user?.email}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-black shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-black text-slate-950 truncate">
                        {session.user?.name || 'Pengguna'}
                      </p>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full border border-black font-black uppercase whitespace-nowrap ${
                          isAdmin ? 'bg-purple-200 text-purple-950' : 'bg-amber-200 text-amber-950'
                        }`}
                      >
                        {userRole === 'super_admin' ? 'SUPER ADMIN' : userRole === 'admin' ? 'ADMIN' : 'MEMBER'}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono font-bold text-slate-700 truncate" title={session.user?.email || ''}>
                      {session.user?.email}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-200 border-2 border-black font-black text-sm text-slate-950 shadow-[2px_2px_0px_0px_#000] text-center hover:bg-cyan-300 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-950" />
                    <span>Dashboard Admin</span>
                  </Link>
                )}

                <RetroButton
                  variant="danger"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="w-4 h-4" /> Keluar (Logout)
                </RetroButton>
              </div>
            ) : (
              <div className="pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <RetroButton variant="primary" size="md" className="w-full justify-center">
                    <LogIn className="w-4 h-4" /> Masuk
                  </RetroButton>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
