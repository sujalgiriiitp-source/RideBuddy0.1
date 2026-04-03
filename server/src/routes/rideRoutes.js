const express = require('express');
const rideController = require('../controllers/rideController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRideSchema, joinRideSchema, rideQuerySchema } = require('../validations/rideValidation');

const router = express.Router();

router.get('/', validate(rideQuerySchema, 'query'), rideController.getRides);
router.get('/:id', rideController.getRideById);
router.post('/', auth, validate(createRideSchema), rideController.createRide);
router.post('/:id/join', auth, validate(joinRideSchema), rideController.joinRide);

module.exports = router;
