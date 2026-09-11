import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'super_admin' | 'admin' | 'user';

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  isWhitelisted: boolean;
  lastLoginAt?: Date;
  lastIpAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: { type: String, enum: ['super_admin', 'admin', 'user'], default: 'user' },
    isWhitelisted: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    lastIpAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
