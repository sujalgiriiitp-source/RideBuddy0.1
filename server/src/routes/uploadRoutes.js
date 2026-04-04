const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// POST /api/upload/image - Upload chat image
router.post(
  '/image',
  auth,
  upload.single('image'),
  handleMulterError,
  uploadController.uploadImage
);

module.exports = router;
