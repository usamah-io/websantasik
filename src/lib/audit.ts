import { connectToDatabase } from './mongodb';
import { AuditLog } from './models/AuditLog';
import { headers } from 'next/headers';
import crypto from 'crypto';

export interface AuditParams {
  email: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

// In-memory audit log storage for fallback when DB is offline
const memoryAuditLogs: Array<{
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  details?: string;
  timestamp: Date;
}> = [
  {
    id: 'mock-1',
    email: 'admin@santasikmalaya.org',
    ipAddress: '180.252.120.44',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
    action: 'SUPER_ADMIN_LOGIN_SUCCESS',
    details: 'Login Google OAuth berhasil sebagai Super Admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: 'mock-2',
    email: 'pengurus@santasikmalaya.org',
    ipAddress: '36.85.15.92',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    action: 'CREATE_NEWS',
    details: 'Menerbitkan berita "Festival Budaya Tasikmalaya 2026"',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 'mock-3',
    email: 'user@gmail.com',
    ipAddress: '125.160.22.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) Mobile/15E148',
    action: 'USER_LOGIN',
    details: 'Google login otomatis dengan role default USER',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
  },
];

// SHA-256 IP Anonymizer helper for privacy compliance option
export function hashIpAddress(ip: string): string {
  const salt = process.env.NEXTAUTH_SECRET || 'san-tasikmalaya-secret';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex').substring(0, 16);
}

export async function recordAuditLog(params: AuditParams) {
  let ipAddress = params.ipAddress;
  let userAgent = params.userAgent;

  if (!ipAddress || !userAgent) {
    try {
      const headerList = await headers();
      const forwardedFor = headerList.get('x-forwarded-for');
      const realIp = headerList.get('x-real-ip');
      ipAddress = ipAddress || (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1');
      userAgent = userAgent || headerList.get('user-agent') || 'Unknown Client';
    } catch {
      ipAddress = ipAddress || '127.0.0.1';
      userAgent = userAgent || 'Server-Action/Internal';
    }
  }

  const logEntry = {
    email: params.email,
    ipAddress: ipAddress || '127.0.0.1',
    userAgent: userAgent || 'Unknown User-Agent',
    action: params.action,
    details: params.details || '',
    timestamp: new Date(),
  };

  memoryAuditLogs.unshift({
    id: 'mem-' + Date.now(),
    ...logEntry,
  });

  try {
    await connectToDatabase();
    await AuditLog.create(logEntry);
    console.log(`[AUDIT_LOG] Saved to MongoDB: ${logEntry.action} by ${logEntry.email} (IP: ${logEntry.ipAddress})`);
  } catch (err) {
    console.warn('[AUDIT_LOG] Saved to memory store (DB offline):', (err as Error).message);
  }

  return logEntry;
}

export async function getRecentAuditLogs(limit: number = 25) {
  try {
    await connectToDatabase();
    const dbLogs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit).lean();
    if (dbLogs && dbLogs.length > 0) {
      return dbLogs.map((log: any) => ({
        id: log._id.toString(),
        email: log.email,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        action: log.action,
        details: log.details || '',
        timestamp: new Date(log.timestamp),
      }));
    }
  } catch {}

  return memoryAuditLogs.slice(0, limit);
}
