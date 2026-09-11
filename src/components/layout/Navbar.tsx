'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { RetroButton } from '../ui/RetroButton';
import { FileText, Users, LogOut, Menu, X, LogIn } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicNavLinks = [
    { name: 'Berita & Warta', href: '/berita', icon: FileText },
    { name: 'Direktori Anggota', href: '/anggota', icon: Users },
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

        {/* Auth Control (Login if unauthenticated, Avatar + Logout if logged in) */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-2.5">
              <Link href="/admin" title="Buka Dashboard Admin">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-amber-100 transition-colors">
                  <img
                    src={session.user?.image || 'https://api.dicebear.com/7.x/bottts/svg?seed=admin'}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full border border-black"
                  />
                  <span className="text-xs font-black text-slate-950 max-w-[100px] truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
              </Link>
              <RetroButton
                variant="danger"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </RetroButton>
            </div>
          ) : (
            <Link href="/admin/login">
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
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-cyan-200 border-2 border-black font-black text-sm text-slate-950 shadow-[2px_2px_0px_0px_#000] text-center"
                >
                  Dashboard Admin
                </Link>
                <RetroButton
                  variant="danger"
                  size="md"
                  className="w-full"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="w-4 h-4" /> Logout ({session.user?.name || session.user?.email})
                </RetroButton>
              </div>
            ) : (
              <div className="pt-2">
                <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                  <RetroButton variant="primary" size="md" className="w-full">
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
