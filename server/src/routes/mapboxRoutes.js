const express = require('express');
const router = express.Router();
const mapboxController = require('../controllers/mapboxController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/mapbox/geocode - Forward geocoding
router.get('/geocode', mapboxController.geocode);

// GET /api/mapbox/reverse-geocode - Reverse geocoding
router.get('/reverse-geocode', mapboxController.reverseGeocode);

// POST /api/mapbox/directions - Get directions
router.post('/directions', mapboxController.getDirections);

// POST /api/mapbox/route - Get route (simplified directions)
router.post('/route', mapboxController.getRoute);

module.exports = router;
