const MapboxService = require('../services/mapboxService');
const { StatusCodes } = require('http-status-codes');

/**
 * Geocode address to coordinates
 */
const geocode = async (req, res) => {
  try {
    const { query, longitude, latitude, limit = 5 } = req.query;

    if (!query) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const options = { limit: parseInt(limit) };
    
    if (longitude && latitude) {
      options.proximity = {
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude)
      };
    }

    const places = await MapboxService.geocode(query, options);

    res.status(StatusCodes.OK).json({
      success: true,
      places
    });
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to geocode address'
    });
  }
};

/**
 * Reverse geocode coordinates to address
 */
const reverseGeocode = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Longitude and latitude parameters are required'
      });
    }

    const place = await MapboxService.reverseGeocode(
      parseFloat(longitude),
      parseFloat(latitude)
    );

    res.status(StatusCodes.OK).json({
      success: true,
      place
    });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to reverse geocode coordinates'
    });
  }
};

/**
 * Get directions between waypoints
 */
const getDirections = async (req, res) => {
  try {
    const { waypoints, profile = 'driving' } = req.body;

    if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'At least 2 waypoints are required'
      });
    }

    const result = await MapboxService.getDirections(waypoints, { profile });

    res.status(StatusCodes.OK).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Directions error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get directions'
    });
  }
};

/**
 * Get route polyline and metadata
 */
const getRoute = async (req, res) => {
  try {
    const { source, destination, profile = 'driving' } = req.body;

    if (!source || !destination) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Source and destination coordinates are required'
      });
    }

    const route = await MapboxService.getRoute(
      [source, destination],
      profile
    );

    res.status(StatusCodes.OK).json({
      success: true,
      route
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get route'
    });
  }
};

module.exports = {
  geocode,
  reverseGeocode,
  getDirections,
  getRoute
};
