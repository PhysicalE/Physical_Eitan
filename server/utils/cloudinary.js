const cloudinary = require('cloudinary').v2;
const streamifier = require("streamifier");
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image to the correct Cloudinary folder based on role and type
 * @param {string} filePath - Local path to the file
 * @param {string} role - 'admin' | 'teacher' | 'student'
 * @param {string} type - 'question' | 'solution' | 'detailed'
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
async function uploadImageToCloudinary(fileBuffer, role, type) {
  const isApproved = role === 'admin' || role === 'teacher';
  const folderPrefix = isApproved ? 'CLOUDINARY_FOLDER_APPROVED_' : 'CLOUDINARY_FOLDER_UNAPPROVED_';
  const envKey = `${folderPrefix}${type.toUpperCase()}`;
  const folder = process.env[envKey];

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result); // includes secure_url and public_id
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
}

/**
 * Moves an image from one folder to another in Cloudinary
 * @param {string} publicId - The current public_id of the image
 * @param {string} targetFolder - The target folder name
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
async function moveImageToFolder(publicId, targetFolder) {
  try {
    // Extract just the filename from the current public_id
    const filename = publicId.split('/').pop();
    const newPublicId = `${targetFolder}/${filename}`;
    
    console.log(`📂 Moving image: ${publicId} → ${newPublicId}`);
    
    const result = await cloudinary.uploader.rename(publicId, newPublicId, {
      resource_type: 'image',
      overwrite: true
    });
    
    console.log(`✅ Image moved successfully: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(`❌ Error moving image ${publicId}:`, error);
    throw error;
  }
}



async function deleteImageFromCloudinary(publicId) {
  await cloudinary.uploader.destroy(publicId);
}

module.exports = {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  moveImageToFolder
};
