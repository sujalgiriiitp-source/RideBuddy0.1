const express = require('express');
const rideController = require('../controllers/rideController');
const auth = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
	createRideSchema,
	joinRideSchema,
	rideQuerySchema,
	acceptRideSchema,
	rideStatusSchema
} = require('../validations/rideValidation');

const router = express.Router();

router.get('/', validate(rideQuerySchema, 'query'), rideController.getRides);
router.get('/status', auth, validate(rideStatusSchema, 'query'), rideController.getRideStatus);
router.post('/status', auth, validate(rideStatusSchema), rideController.getRideStatus);
router.get('/:id', rideController.getRideById);
router.post('/create', auth, authorizeRoles('user', 'driver', 'admin'), validate(createRideSchema), rideController.createRide);
router.post('/accept', auth, authorizeRoles('driver', 'admin'), validate(acceptRideSchema), rideController.acceptRide);
router.post('/', auth, validate(createRideSchema), rideController.createRide);
router.post('/:id/join', auth, validate(joinRideSchema), rideController.joinRide);

module.exports = router;
