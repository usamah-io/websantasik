import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { recordAuditLog } from './audit';
import { connectToDatabase } from './mongodb';
import { User, UserRole } from './models/User';

const defaultSuperAdmins = [
  'san.tasikmalaya.2020@gmail.com',
  'muhammadusamahabdurrahman@gmail.com',
  'admin@santasikmalaya.org',
];

const envSuperAdmins = (process.env.SUPER_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const superAdminEmails = Array.from(new Set([...defaultSuperAdmins, ...envSuperAdmins]));

const adminEmails = (process.env.ALLOWED_ADMIN_EMAILS || 'pengurus@santasikmalaya.org')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'demo-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-google-client-secret',
    }),
    // Demo Credentials Provider for offline/local testing
    CredentialsProvider({
      id: 'demo-admin',
      name: 'Demo Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'san.tasikmalaya.2020@gmail.com' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        if (!email) return null;

        let role: UserRole = 'user';
        if (superAdminEmails.includes(email)) {
          role = 'super_admin';
        } else if (adminEmails.includes(email)) {
          role = 'admin';
        }

        return {
          id: 'usr_' + Date.now(),
          name: email.split('@')[0].toUpperCase() + ` (${role.replace('_', ' ').toUpperCase()})`,
          email: email,
          image: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + email,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const userEmail = user.email.toLowerCase().trim();

      try {
        await connectToDatabase();
        const existingUser = await User.findOne({ email: userEmail });

        let assignedRole: UserRole = 'user';
        let isWhitelisted = false;

        if (superAdminEmails.includes(userEmail)) {
          assignedRole = 'super_admin';
          isWhitelisted = true;
        } else if (existingUser) {
          assignedRole = existingUser.role;
          isWhitelisted = existingUser.isWhitelisted;
        } else if (adminEmails.includes(userEmail)) {
          assignedRole = 'admin';
          isWhitelisted = true;
        }

        await User.findOneAndUpdate(
          { email: userEmail },
          {
            name: user.name || 'Pengurus San Tasik',
            email: userEmail,
            image: user.image,
            role: assignedRole,
            isWhitelisted,
            lastLoginAt: new Date(),
          },
          { upsert: true, new: true }
        );

        await recordAuditLog({
          email: userEmail,
          action: `${assignedRole.toUpperCase()}_LOGIN_SUCCESS`,
          details: `Login Google OAuth sebagai ${assignedRole.toUpperCase()}`,
        });
      } catch (err) {
        console.warn('Could not sync user to DB on sign-in:', (err as Error).message);
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role || 'user';
      }
      return session;
    },
    async jwt({ token, user }) {
      const email = (user?.email || token?.email || '').toLowerCase().trim();
      if (superAdminEmails.includes(email)) {
        token.role = 'super_admin';
      } else if (user) {
        token.role = (user as any).role || (adminEmails.includes(email) ? 'admin' : 'user');
      }
      return token;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'san-tasikmalaya-super-secret-key-2026',
  session: {
    strategy: 'jwt',
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

// Any logged-in user
export async function requireUserSession() {
  const session = await getAuthSession();
  if (!session || !session.user || !session.user.email) {
    throw new Error('Akses ditolak: Anda harus login untuk melakukan aksi ini.');
  }
  return session as {
    user: {
      id?: string;
      name?: string | null;
      email: string;
      image?: string | null;
      role?: UserRole;
    };
  };
}

// Regular Admin or Super Admin
export async function requireAdminSession() {
  const session = await requireUserSession();
  const role = session.user.role || 'user';
  if (role !== 'admin' && role !== 'super_admin') {
    throw new Error('Akses ditolak: Aksi ini memerlukan hak akses Admin atau Super Admin.');
  }
  return session;
}

// Super Admin Only
export async function requireSuperAdminSession() {
  const session = await requireUserSession();
  const role = session.user.role || 'user';
  if (role !== 'super_admin') {
    throw new Error('Akses ditolak: Aksi ini khusus untuk Super Admin.');
  }
  return session;
}
