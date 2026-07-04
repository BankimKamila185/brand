import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export const uploadImage = async (
  filePath: string,
  folder: string = 'tevar/products',
): Promise<{ url: string; publicId: string; width: number; height: number }> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    overwrite: false,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
};

export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export const getOptimizedUrl = (
  publicId: string,
  width?: number,
  height?: number,
): string => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...(width && { width }),
    ...(height && { height }),
    crop: 'fill',
    gravity: 'auto',
  });
};
