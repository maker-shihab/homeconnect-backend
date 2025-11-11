// src/shared/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/AppError';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer: Buffer, folder?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log('🔍 Cloudinary config check:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      has_api_key: !!process.env.CLOUDINARY_API_KEY,
      has_api_secret: !!process.env.CLOUDINARY_API_SECRET,
      folder: folder || 'default'
    });

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: folder || 'properties',
        timeout: 60000, // 60 seconds timeout
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(new AppError(`Cloudinary upload failed: ${error.message}`, 500));
        } else if (result) {
          console.log('✅ Cloudinary upload result:', {
            public_id: result.public_id,
            url: result.secure_url,
            format: result.format
          });
          resolve(result);
        } else {
          reject(new AppError('Cloudinary upload returned no result', 500));
        }
      }
    );

    uploadStream.on('error', (error) => {
      console.error('❌ Cloudinary stream error:', error);
      reject(new AppError(`Cloudinary stream error: ${error.message}`, 500));
    });

    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok') {
      throw new AppError('Failed to delete image from Cloudinary', 500);
    }
  } catch (error) {
    throw new AppError('Failed to delete image from Cloudinary', 500);
  }
};