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
    await connectToDatabase();

    // 1. Real views count from all news articles
    const viewsAgg = await News.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);
    if (viewsAgg && viewsAgg.length > 0 && typeof viewsAgg[0].total === 'number') {
      totalViews = viewsAgg[0].total;
    }

    // 2. Real news count
    totalNews = await News.countDocuments();

    // 3. Real members count
    totalMembers = await Member.countDocuments();

    // 4. Real admin/super_admin users from MongoDB
    const dbUsers = await User.find({
      $or: [
        { role: { $in: ['super_admin', 'admin'] } },
        { isWhitelisted: true },
      ],
    })
      .sort({ lastLoginAt: -1 })
      .limit(10)
      .lean();

    if (dbUsers && dbUsers.length > 0) {
      activeAdmins = dbUsers.map((u: any) => ({
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
  const logs = await getRecentAuditLogs(25);
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
