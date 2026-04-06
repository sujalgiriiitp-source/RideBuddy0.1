const express = require('express');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const bookingController = require('../controllers/bookingController');
const {
  createBookingSchema,
  cancelBookingParamsSchema,
  rideBookingCheckParamsSchema,
  bookingQuerySchema
} = require('../validations/bookingValidation');

const router = express.Router();

router.use(auth);

router.get('/my', validate(bookingQuerySchema, 'query'), bookingController.getMyBookings);
router.get('/ride/:rideId/mine', validate(rideBookingCheckParamsSchema, 'params'), bookingController.getMyRideBooking);
router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.post('/:id/cancel', validate(cancelBookingParamsSchema, 'params'), bookingController.cancelBooking);

module.exports = router;
