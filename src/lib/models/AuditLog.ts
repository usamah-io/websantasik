import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  email: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  details?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    email: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  {
    collection: 'audit_logs',
    timestamps: false,
  }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
