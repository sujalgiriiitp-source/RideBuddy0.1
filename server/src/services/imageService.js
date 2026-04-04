const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Image Processing Service
 * Handles image compression and thumbnail generation
 */
class ImageService {
  /**
   * Process uploaded image - compress and generate thumbnail
   * @param {string} filePath - Path to uploaded file
   * @returns {Promise<object>} Object with original and thumbnail URLs
   */
  static async processImage(filePath) {
    try {
      const filename = path.basename(filePath);
      const dir = path.dirname(filePath);
      const ext = path.extname(filename);
      const nameWithoutExt = path.basename(filename, ext);

      // Generate thumbnail filename
      const thumbnailFilename = `${nameWithoutExt}-thumb${ext}`;
      const thumbnailPath = path.join(dir, thumbnailFilename);

      // Get image metadata
      const metadata = await sharp(filePath).metadata();

      // Compress original image (max 1920px width, 80% quality)
      await sharp(filePath)
        .resize(1920, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 80 })
        .toFile(`${filePath}.tmp`);

      // Replace original with compressed version
      await fs.rename(`${filePath}.tmp`, filePath);

      // Generate thumbnail (300px width)
      await sharp(filePath)
        .resize(300, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 70 })
        .toFile(thumbnailPath);

      // Return relative URLs
      const imageUrl = `/uploads/chat-images/${filename}`;
      const thumbnailUrl = `/uploads/chat-images/${thumbnailFilename}`;

      return {
        imageUrl,
        thumbnailUrl,
        width: metadata.width,
        height: metadata.height,
        size: metadata.size
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Delete image and its thumbnail
   * @param {string} imageUrl - URL of the image to delete
   */
  static async deleteImage(imageUrl) {
    try {
      const filename = path.basename(imageUrl);
      const dir = path.join('uploads', 'chat-images');
      const filePath = path.join(dir, filename);

      // Extract thumbnail filename
      const ext = path.extname(filename);
      const nameWithoutExt = path.basename(filename, ext);
      const thumbnailFilename = `${nameWithoutExt}-thumb${ext}`;
      const thumbnailPath = path.join(dir, thumbnailFilename);

      // Delete both files
      await Promise.all([
        fs.unlink(filePath).catch(() => {}),
        fs.unlink(thumbnailPath).catch(() => {})
      ]);
    } catch (error) {
      console.error('Image deletion error:', error);
    }
  }
}

module.exports = ImageService;
