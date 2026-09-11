import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  instagramUrl: string;
  youtubeUrl: string;
  whatsappNumber: string;
  email: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, default: 'site_settings' },
    instagramUrl: {
      type: String,
      default: 'https://www.instagram.com/san.tasikmalaya.2020/',
    },
    youtubeUrl: {
      type: String,
      default: 'https://www.youtube.com/@sanchaptertasikmalaya3661',
    },
    whatsappNumber: { type: String, default: '081234567890' },
    email: { type: String, default: 'san.tasikmalaya.2020@gmail.com' },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
