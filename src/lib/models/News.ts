import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INews extends Document {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  imageUrl?: string;
  images?: string[];
  author: string;
  views: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true, default: 'Kegiatan' },
    imageUrl: { type: String, default: '/images/placeholder-news.jpg' },
    images: { type: [String], default: [] },
    author: { type: String, required: true, default: 'Humas San Tasik' },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const News: Model<INews> =
  mongoose.models.News || mongoose.model<INews>('News', NewsSchema);
