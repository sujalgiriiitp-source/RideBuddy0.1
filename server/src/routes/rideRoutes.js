const express = require('express');
const rideController = require('../controllers/rideController');
const auth = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { checkDailyRideLimit, incrementDailyRideCount, checkSubscriptionStatus } = require('../middleware/subscriptionMiddleware');
const {
	createRideSchema,
	joinRideSchema,
	rideQuerySchema,
	acceptRideSchema,
	rideStatusSchema
} = require('../validations/rideValidation');

const router = express.Router();

router.get('/', validate(rideQuerySchema, 'query'), rideController.getRides);
router.get('/status', auth, checkSubscriptionStatus, validate(rideStatusSchema, 'query'), rideController.getRideStatus);
router.post('/status', auth, checkSubscriptionStatus, validate(rideStatusSchema), rideController.getRideStatus);
router.get('/:id', rideController.getRideById);
router.post('/create', auth, checkSubscriptionStatus, checkDailyRideLimit, authorizeRoles('user', 'driver', 'admin'), validate(createRideSchema), incrementDailyRideCount, rideController.createRide);
router.post('/accept', auth, checkSubscriptionStatus, authorizeRoles('driver', 'admin'), validate(acceptRideSchema), rideController.acceptRide);
router.post('/', auth, checkSubscriptionStatus, checkDailyRideLimit, validate(createRideSchema), incrementDailyRideCount, rideController.createRide);
router.post('/:id/join', auth, checkSubscriptionStatus, validate(joinRideSchema), rideController.joinRide);

module.exports = router;
