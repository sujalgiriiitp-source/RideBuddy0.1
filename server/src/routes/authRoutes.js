const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { signupSchema, loginSchema } = require('../validations/authValidation');

const router = express.Router();

router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

module.exports = router;
