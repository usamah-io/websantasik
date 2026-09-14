'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { News } from '@/lib/models/News';
import { User } from '@/lib/models/User';
import { Member } from '@/lib/models/Member';
import { getRecentAuditLogs } from '@/lib/audit';
import { requireSuperAdminSession } from '@/lib/auth';

export async function getAdminRealtimeStats() {
  const session = await requireSuperAdminSession();

  let totalViews = 0;
  let totalNews = 0;
  let totalMembers = 0;
  let activeAdmins: Array<{ email: string; name: string; role: string; lastIp: string; lastLogin: string }> = [];

  try {
    const dbQueryPromise = (async () => {
      await connectToDatabase();
      return await Promise.allSettled([
        News.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
        News.countDocuments(),
        Member.countDocuments(),
        User.find({
          $or: [
            { role: { $in: ['super_admin', 'admin'] } },
            { isWhitelisted: true },
          ],
        })
          .sort({ lastLoginAt: -1 })
          .limit(10)
          .lean(),
      ]);
    })();

    const timeoutGuard = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => reject(new Error('Query database timeout')), 4000);
      if (typeof timer.unref === 'function') timer.unref();
    });

    const [viewsRes, newsRes, membersRes, usersRes] = await Promise.race([
      dbQueryPromise,
      timeoutGuard,
    ]);

    if (viewsRes.status === 'fulfilled' && viewsRes.value.length > 0 && typeof viewsRes.value[0].total === 'number') {
      totalViews = viewsRes.value[0].total;
    }
    if (newsRes.status === 'fulfilled') {
      totalNews = newsRes.value;
    }
    if (membersRes.status === 'fulfilled') {
      totalMembers = membersRes.value;
    }
    if (usersRes.status === 'fulfilled' && usersRes.value.length > 0) {
      activeAdmins = usersRes.value.map((u: any) => ({
        email: u.email,
        name: u.name || u.email.split('@')[0],
        role: u.role || 'admin',
        lastIp: u.lastIpAddress || '127.0.0.1',
        lastLogin: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('DB stats aggregate error:', (err as Error).message);
  }

  // Ensure current authenticated user is included in active admins list
  const currentEmail = session.user.email.toLowerCase().trim();
  if (!activeAdmins.some((a) => a.email.toLowerCase() === currentEmail)) {
    activeAdmins.unshift({
      email: session.user.email,
      name: session.user.name || session.user.email.split('@')[0],
      role: (session.user as any).role || 'super_admin',
      lastIp: 'Sesi Aktif',
      lastLogin: new Date().toISOString(),
    });
  }

  // 5. Real audit logs from MongoDB collection audit_logs
  let logs: any[] = [];
  try {
    logs = (await getRecentAuditLogs(25)) || [];
  } catch (e) {
    console.warn('Error fetching audit logs in getAdminRealtimeStats:', (e as Error).message);
  }

  const validIps = logs.map((l) => l.ipAddress).filter((ip) => ip && ip !== 'Unknown');
  const uniqueIPs = new Set(validIps).size;

  return {
    totalViews,
    totalNews,
    totalMembers,
    uniqueIPsCount: uniqueIPs > 0 ? uniqueIPs : (activeAdmins.length > 0 ? 1 : 0),
    activeAdmins,
    recentAuditLogs: logs,
  };
}
