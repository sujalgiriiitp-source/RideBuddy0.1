const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
	updateVehicleSchema,
	userProfileParamsSchema,
	uploadPhotoSchema,
	updateProfileSchema
} = require('../validations/userValidation');

const router = express.Router();

router.get('/profile', auth, userController.getProfile);
router.get('/profile/:userId', validate(userProfileParamsSchema, 'params'), userController.getUserProfile);
router.put('/profile', auth, validate(updateProfileSchema), userController.updateProfile);
router.put('/vehicle', auth, validate(updateVehicleSchema), userController.updateVehicle);
router.post('/photo', auth, validate(uploadPhotoSchema), userController.uploadPhoto);

module.exports = router;
