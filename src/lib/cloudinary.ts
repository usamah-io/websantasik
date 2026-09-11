import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo-cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo-secret',
  secure: true,
});

export async function uploadImageToCloudinary(fileBuffer: Buffer | string, filename?: string): Promise<string> {
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'demo-cloud' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'demo-key';

  if (isCloudinaryConfigured) {
    try {
      if (typeof fileBuffer === 'string') {
        const res = await cloudinary.uploader.upload(fileBuffer, {
          folder: 'san_tasikmalaya/news',
          public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
        });
        return res.secure_url;
      } else {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'san_tasikmalaya/news',
            },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result.secure_url);
            }
          );
          uploadStream.end(fileBuffer);
        });
      }
    } catch (err) {
      console.warn('Cloudinary upload error, using fallback image:', err);
    }
  }

  // Fallback if Cloudinary keys aren't set yet in dev
  if (typeof fileBuffer === 'string' && fileBuffer.startsWith('data:image')) {
    return fileBuffer;
  }
  
  return '/images/san-activity.jpg';
}

