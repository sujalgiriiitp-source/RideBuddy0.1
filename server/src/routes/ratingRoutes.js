const express = require('express');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const ratingController = require('../controllers/ratingController');
const { createRatingSchema, userRatingsParamsSchema } = require('../validations/ratingValidation');

const router = express.Router();

router.post('/', auth, validate(createRatingSchema), ratingController.createRating);
router.get('/user/:userId', validate(userRatingsParamsSchema, 'params'), ratingController.getRatingsForUser);

module.exports = router;
