const express = require('express');
const intentController = require('../controllers/intentController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createIntentSchema,
  intentQuerySchema,
  nearbyIntentQuerySchema,
  respondIntentSchema,
  intentIdParamsSchema
} = require('../validations/intentValidation');

const router = express.Router();

router.get('/', auth, validate(intentQuerySchema, 'query'), intentController.getIntents);
router.get('/nearby', auth, validate(nearbyIntentQuerySchema, 'query'), intentController.getNearbyIntents);
router.get('/my-intents', auth, intentController.getMyIntents);
router.post('/', auth, validate(createIntentSchema), intentController.createIntent);
router.post('/:id/respond', auth, validate(intentIdParamsSchema, 'params'), validate(respondIntentSchema), intentController.respondToIntent);
router.delete('/:id', auth, validate(intentIdParamsSchema, 'params'), intentController.cancelIntent);

module.exports = router;
