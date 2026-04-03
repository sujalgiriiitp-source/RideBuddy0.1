const express = require('express');
const intentController = require('../controllers/intentController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createIntentSchema, intentQuerySchema, matchQuerySchema } = require('../validations/intentValidation');

const router = express.Router();

router.get('/', validate(intentQuerySchema, 'query'), intentController.getIntents);
router.get('/match', auth, validate(matchQuerySchema, 'query'), intentController.getMatches);
router.post('/', auth, validate(createIntentSchema), intentController.createIntent);

module.exports = router;
