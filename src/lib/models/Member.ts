import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMember extends Document {
  name: string;
  role: string;
  division: string;
  photoUrl: string;
  bio?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  imagePosition?: string;
  order: number;
}

const MemberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    division: { type: String, required: true, default: 'Pengurus Harian' },
    photoUrl: { type: String, default: '/images/san-activity.jpg' },
    bio: { type: String },
    email: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    whatsapp: { type: String },
    imagePosition: { type: String, default: 'object-center' },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);
