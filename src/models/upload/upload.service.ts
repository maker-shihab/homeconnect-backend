// src/models/upload/upload.service.ts
import { deleteFromCloudinary, uploadToCloudinary } from '../../shared/lib/cloudinary';
import { AppError } from '../../shared/utils/AppError';

export class UploadService {
  async uploadImage(file: Express.Multer.File, folder?: string): Promise<{ url: string; publicId: string }> {
    try {
      console.log('🔍 Uploading image to Cloudinary:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        folder: folder || 'default'
      });

      const result = await uploadToCloudinary(file.buffer, folder);

      console.log('✅ Image upload successful:', {
        url: result.secure_url,
        publicId: result.public_id
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw new AppError(`Failed to upload image: ${(error as Error).message}`, 500);
    }
  }

  async uploadMultipleImages(files: Express.Multer.File[], folder?: string): Promise<{ url: string; publicId: string }[]> {
    try {
      console.log('🔍 Uploading multiple images to Cloudinary:', {
        fileCount: files.length,
        folder: folder || 'default'
      });

      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);

      console.log('✅ Multiple images upload successful');
      return results;
    } catch (error) {
      console.error('❌ Multiple images upload failed:', error);
      throw new AppError(`Failed to upload images: ${(error as Error).message}`, 500);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await deleteFromCloudinary(publicId);
    } catch (error) {
      throw new AppError('Failed to delete image', 500);
    }
  }

  async uploadDocument(file: Express.Multer.File, folder?: string): Promise<{ url: string; publicId: string }> {
    try {
      const result = await uploadToCloudinary(file.buffer, folder);

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      throw new AppError('Failed to upload document', 500);
    }
  }
}

export const uploadService = new UploadService();