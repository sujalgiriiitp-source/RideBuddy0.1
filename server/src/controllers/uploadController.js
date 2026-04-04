const { StatusCodes } = require('http-status-codes');
const ImageService = require('../services/imageService');

/**
 * Upload chat image
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Process image (compress and generate thumbnail)
    const result = await ImageService.processImage(req.file.path);

    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

module.exports = {
  uploadImage
};
