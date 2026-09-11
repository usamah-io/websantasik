import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGallery extends Document {
  title: string;
  imageUrl: string;
  caption?: string;
  order: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String },
    order: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Gallery: Model<IGallery> =
  mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);
