const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxDirections = require('@mapbox/mapbox-sdk/services/directions');

// Check for Mapbox token
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_TOKEN || MAPBOX_TOKEN.startsWith('pk.test.') || MAPBOX_TOKEN === 'your-mapbox-access-token-here') {
  console.warn('⚠️  Mapbox access token not configured. Map features will be disabled.');
  console.warn('   Set MAPBOX_ACCESS_TOKEN in .env to enable maps.');
}

// Initialize Mapbox clients only if valid token
let geocodingClient = null;
let directionsClient = null;

if (MAPBOX_TOKEN && !MAPBOX_TOKEN.startsWith('pk.test.') && MAPBOX_TOKEN !== 'your-mapbox-access-token-here') {
  try {
    geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN });
    directionsClient = mbxDirections({ accessToken: MAPBOX_TOKEN });
  } catch (error) {
    console.error('Failed to initialize Mapbox clients:', error.message);
  }
}

/**
 * Mapbox Service
 * Handles geocoding, reverse geocoding, place search, and route directions
 */
class MapboxService {
  /**
   * Forward geocoding - Convert address to coordinates
   * @param {string} query - Address or place name
   * @param {object} options - Optional parameters (proximity, bbox, country, limit)
   * @returns {Promise<Array>} Array of place objects
   */
  static async geocode(query, options = {}) {
    if (!geocodingClient) {
      throw new Error('Mapbox service not configured. Set MAPBOX_ACCESS_TOKEN in .env');
    }

    try {
      const request = geocodingClient.forwardGeocode({
        query,
        limit: options.limit || 5,
        ...(options.proximity && { proximity: options.proximity }),
        ...(options.bbox && { bbox: options.bbox }),
        ...(options.country && { countries: [options.country] })
      });

      const response = await request.send();
      
      return response.body.features.map(feature => ({
        id: feature.id,
        name: feature.place_name,
        shortName: feature.text,
        coordinates: {
          longitude: feature.center[0],
          latitude: feature.center[1]
        },
        context: feature.context || [],
        placeType: feature.place_type,
        bbox: feature.bbox
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Reverse geocoding - Convert coordinates to address
   * @param {number} longitude - Longitude coordinate
   * @param {number} latitude - Latitude coordinate
   * @param {object} options - Optional parameters (types, limit)
   * @returns {Promise<object>} Place object
   */
  static async reverseGeocode(longitude, latitude, options = {}) {
    if (!geocodingClient) {
      throw new Error('Mapbox service not configured. Set MAPBOX_ACCESS_TOKEN in .env');
    }

    try {
      const request = geocodingClient.reverseGeocode({
        query: [longitude, latitude],
        limit: options.limit || 1,
        ...(options.types && { types: options.types })
      });

      const response = await request.send();
      
      if (response.body.features.length === 0) {
        return null;
      }

      const feature = response.body.features[0];
      return {
        id: feature.id,
        name: feature.place_name,
        shortName: feature.text,
        coordinates: {
          longitude: feature.center[0],
          latitude: feature.center[1]
        },
        context: feature.context || [],
        placeType: feature.place_type
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  /**
   * Search for places near a location
   * @param {string} query - Search query
   * @param {object} proximity - { longitude, latitude } for proximity bias
   * @param {number} limit - Max number of results
   * @returns {Promise<Array>} Array of place objects
   */
  static async searchPlaces(query, proximity = null, limit = 10) {
    const options = { limit };
    
    if (proximity) {
      options.proximity = [proximity.longitude, proximity.latitude];
    }

    return this.geocode(query, options);
  }

  /**
   * Get directions between waypoints
   * @param {Array} waypoints - Array of [longitude, latitude] coordinates
   * @param {object} options - Optional parameters (profile, alternatives, geometries, overview)
   * @returns {Promise<object>} Route object with polyline, distance, duration
   */
  static async getDirections(waypoints, options = {}) {
    if (!directionsClient) {
      throw new Error('Mapbox service not configured. Set MAPBOX_ACCESS_TOKEN in .env');
    }

    try {
      const request = directionsClient.getDirections({
        waypoints: waypoints.map(wp => ({
          coordinates: Array.isArray(wp) ? wp : [wp.longitude, wp.latitude]
        })),
        profile: options.profile || 'driving', // driving, driving-traffic, walking, cycling
        alternatives: options.alternatives !== false,
        geometries: options.geometries || 'geojson',
        overview: options.overview || 'full',
        steps: options.steps !== false,
        banner_instructions: true,
        voice_instructions: true
      });

      const response = await request.send();
      
      if (response.body.routes.length === 0) {
        throw new Error('No routes found');
      }

      const routes = response.body.routes.map(route => ({
        distance: route.distance, // meters
        duration: route.duration, // seconds
        geometry: route.geometry, // GeoJSON LineString
        legs: route.legs.map(leg => ({
          distance: leg.distance,
          duration: leg.duration,
          steps: leg.steps ? leg.steps.map(step => ({
            distance: step.distance,
            duration: step.duration,
            instruction: step.maneuver.instruction,
            name: step.name,
            coordinates: step.maneuver.location
          })) : []
        }))
      }));

      return {
        routes,
        waypoints: response.body.waypoints
      };
    } catch (error) {
      console.error('Directions error:', error);
      throw new Error('Failed to get directions');
    }
  }

  /**
   * Get route polyline for display on map
   * @param {Array} waypoints - Start and end coordinates
   * @param {string} profile - Routing profile (driving, walking, cycling)
   * @returns {Promise<object>} Simplified route object
   */
  static async getRoute(waypoints, profile = 'driving') {
    const result = await this.getDirections(waypoints, { 
      profile, 
      alternatives: false,
      steps: false 
    });
    
    const route = result.routes[0];
    return {
      polyline: route.geometry.coordinates, // Array of [lng, lat] points
      distance: route.distance, // meters
      duration: route.duration, // seconds
      distanceKm: (route.distance / 1000).toFixed(2),
      durationMin: Math.round(route.duration / 60)
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {object} point1 - { longitude, latitude }
   * @param {object} point2 - { longitude, latitude }
   * @returns {number} Distance in kilometers
   */
  static calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.latitude)) * 
      Math.cos(this.toRad(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Convert degrees to radians
   */
  static toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if a point is within a certain radius of another point
   * @param {object} center - { longitude, latitude }
   * @param {object} point - { longitude, latitude }
   * @param {number} radiusKm - Radius in kilometers
   * @returns {boolean}
   */
  static isWithinRadius(center, point, radiusKm) {
    const distance = this.calculateDistance(center, point);
    return distance <= radiusKm;
  }

  /**
   * Format duration in seconds to human-readable string
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration (e.g., "1h 23m", "45m")
   */
  static formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format distance in meters to human-readable string
   * @param {number} meters - Distance in meters
   * @returns {string} Formatted distance (e.g., "12.5 km", "850 m")
   */
  static formatDistance(meters) {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  }
}

module.exports = MapboxService;
