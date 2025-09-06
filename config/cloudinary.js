import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;import cloudinary from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath: String) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: 'menu-images', // rasm papkasi Cloudinary’da
    });
    // Yuklagandan so'ng lokal faylni o'chirish (optional)
    fs.unlinkSync(filePath);
    return result.secure_url; // ✅ Shu URL front-end’ga yuboriladi
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return null;
  }
};

