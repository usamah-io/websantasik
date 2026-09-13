import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { recordAuditLog } from './audit';
import { connectToDatabase } from './mongodb';
import { User, UserRole } from './models/User';

const defaultSuperAdmins = [
  'san.tasikmalaya.2020@gmail.com',
  'muhammadusamahabdurrahman@gmail.com',
  'musamahabdurrahmanabdurrahman@gmail.com',
];

const envSuperAdmins = (process.env.SUPER_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const superAdminEmails = Array.from(new Set([...defaultSuperAdmins, ...envSuperAdmins]));

const adminEmails = (process.env.ALLOWED_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === 'production';
const hasHttpsUrl = process.env.NEXTAUTH_URL?.startsWith('https://') || Boolean(process.env.VERCEL);
const useSecureCookies = isProduction && hasHttpsUrl;
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

export const authOptions: NextAuthOptions = {
  useSecureCookies,
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${useSecureCookies ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
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
        } else {
          try {
            await connectToDatabase();
            const u = await User.findOne({ email });
            if (u?.role) role = u.role;
          } catch {}
        }

        return {
          id: 'usr_' + Date.now(),
          name: email.split('@')[0].toUpperCase(),
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

        let ip = '127.0.0.1';
        let ua = 'Browser';
        try {
          const { headers } = await import('next/headers');
          const headerList = await headers();
          const forwarded = headerList.get('x-forwarded-for');
          const realIp = headerList.get('x-real-ip');
          ip = forwarded ? forwarded.split(',')[0].trim() : realIp || '127.0.0.1';
          ua = headerList.get('user-agent') || 'Browser';
        } catch {}

        await User.findOneAndUpdate(
          { email: userEmail },
          {
            name: user.name || existingUser?.name || userEmail.split('@')[0],
            email: userEmail,
            image: user.image || existingUser?.image,
            role: assignedRole,
            isWhitelisted,
            lastLoginAt: new Date(),
            lastIpAddress: ip,
          },
          { upsert: true, new: true }
        );

        await recordAuditLog({
          email: userEmail,
          ipAddress: ip,
          userAgent: ua,
          action: `${assignedRole.toUpperCase()}_LOGIN_SUCCESS`,
          details: `Login Google OAuth berhasil sebagai ${assignedRole.toUpperCase()}`,
        });
      } catch (err) {
        console.warn('Could not sync user to DB on sign-in:', (err as Error).message);
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      const email = (user?.email || token?.email || '').toLowerCase().trim();
      if (!email) return token;
      token.email = email;

      // Fast-path: Instant check against superAdmin / admin email lists (0ms latency, no DB lock)
      if (superAdminEmails.includes(email)) {
        token.role = 'super_admin';
        if (user) token.id = (user as any).id || token.sub;
        return token;
      }
      if (adminEmails.includes(email)) {
        token.role = 'admin';
        if (user) token.id = (user as any).id || token.sub;
        return token;
      }

      // Only query DB if role is not yet assigned or during sign-in / profile update
      if (!token.role || user || trigger === 'update') {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email }).select('role').lean();
          if (dbUser?.role) {
            token.role = dbUser.role;
          } else {
            token.role = token.role || 'user';
          }
        } catch {
          token.role = token.role || 'user';
        }
      }

      if (user) {
        token.id = (user as any).id || token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role || 'user';
        session.user.email = (token.email as string) || session.user.email;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'san-tasikmalaya-super-secret-key-2026',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
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
