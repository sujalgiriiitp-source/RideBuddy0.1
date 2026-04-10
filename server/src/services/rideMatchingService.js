const MapboxService = require('./mapboxService');

/**
 * Ride Matching Service
 * Enhanced matching algorithm with proximity and route overlap detection
 */
class RideMatchingService {
  /**
   * Find matching rides for a travel intent
   * @param {object} intent - Travel intent with source/destination coordinates
   * @param {object} options - Matching options (radiusKm, timeDeltaHours, limit)
   * @returns {Promise<Array>} Sorted array of matching rides
   */
  static async findMatchingRides(intent, options = {}) {
    const {
      radiusKm = 5, // Default 5km radius for pickup/drop proximity
      timeDeltaHours = 2, // Default 2 hour time window
      limit = 20
    } = options;

    const Ride = require('../models/Ride');

    // Time window
    const startTime = new Date(intent.dateTime);
    startTime.setHours(startTime.getHours() - timeDeltaHours);
    const endTime = new Date(intent.dateTime);
    endTime.setHours(endTime.getHours() + timeDeltaHours);

    // Find rides with available seats in time window
    let query = {
      status: 'pending',
      seatsAvailable: { $gt: 0 },
      dateTime: { $gte: startTime, $lte: endTime },
      createdBy: { $ne: intent.userId || intent.user } // Exclude user's own rides
    };

    // If coordinates available, use proximity search
    if (intent.sourceCoordinates && intent.destinationCoordinates) {
      // Find rides with source within radius
      const ridesNearSource = await Ride.find({
        ...query,
        sourceCoordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [intent.sourceCoordinates.longitude, intent.sourceCoordinates.latitude]
            },
            $maxDistance: radiusKm * 1000 // Convert km to meters
          }
        }
      })
        .populate('createdBy', 'name email phone')
        .limit(limit)
        .lean();

      // Score and sort rides
      const scoredRides = ridesNearSource.map(ride => {
        const score = this.calculateMatchScore(intent, ride, radiusKm);
        return { ...ride, matchScore: score };
      });

      // Filter out rides with low scores and sort by score
      return scoredRides
        .filter(ride => ride.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
    } else {
      // Fallback to text-based matching
      const rides = await Ride.find(query)
        .populate('createdBy', 'name email phone')
        .limit(limit)
        .lean();

      // Simple text matching score
      return rides.map(ride => {
        const sourceMatch = this.textSimilarity(intent.source, ride.source);
        const destMatch = this.textSimilarity(intent.destination, ride.destination);
        return {
          ...ride,
          matchScore: (sourceMatch + destMatch) / 2
        };
      }).sort((a, b) => b.matchScore - a.matchScore);
    }
  }

  /**
   * Calculate match score for a ride and intent
   * @param {object} intent - Travel intent
   * @param {object} ride - Ride object
   * @param {number} radiusKm - Search radius in km
   * @returns {number} Score between 0 and 100
   */
  static calculateMatchScore(intent, ride, radiusKm) {
    let score = 0;

    // Source proximity score (40 points max)
    if (intent.sourceCoordinates && ride.sourceCoordinates) {
      const sourceDistance = MapboxService.calculateDistance(
        intent.sourceCoordinates,
        ride.sourceCoordinates
      );
      const sourceScore = Math.max(0, 40 * (1 - sourceDistance / radiusKm));
      score += sourceScore;
    }

    // Destination proximity score (40 points max)
    if (intent.destinationCoordinates && ride.destinationCoordinates) {
      const destDistance = MapboxService.calculateDistance(
        intent.destinationCoordinates,
        ride.destinationCoordinates
      );
      const destScore = Math.max(0, 40 * (1 - destDistance / radiusKm));
      score += destScore;
    }

    // Time proximity score (20 points max)
    const timeDiff = Math.abs(new Date(intent.dateTime) - new Date(ride.dateTime));
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    const timeScore = Math.max(0, 20 * (1 - hoursDiff / 2)); // 2 hour window
    score += timeScore;

    return Math.round(score);
  }

  /**
   * Find rides along a specific route
   * @param {object} routeCoordinates - { source, destination } with coordinates
   * @param {object} options - Search options
   * @returns {Promise<Array>} Rides that overlap with the route
   */
  static async findRidesAlongRoute(routeCoordinates, options = {}) {
    const {
      radiusKm = 2, // Tighter radius for route overlap
      dateTime = new Date(),
      timeDeltaHours = 2
    } = options;

    const Ride = require('../models/Ride');

    // Time window
    const startTime = new Date(dateTime);
    startTime.setHours(startTime.getHours() - timeDeltaHours);
    const endTime = new Date(dateTime);
    endTime.setHours(endTime.getHours() + timeDeltaHours);

    // Find rides within broader area
    const rides = await Ride.find({
      status: 'pending',
      seatsAvailable: { $gt: 0 },
      dateTime: { $gte: startTime, $lte: endTime },
      sourceCoordinates: { $exists: true },
      destinationCoordinates: { $exists: true }
    })
      .populate('createdBy', 'name email phone')
      .lean();

    // Filter rides that have route overlap
    const ridesWithOverlap = [];

    for (const ride of rides) {
      const overlap = this.calculateRouteOverlap(
        routeCoordinates.source,
        routeCoordinates.destination,
        ride.sourceCoordinates,
        ride.destinationCoordinates,
        radiusKm
      );

      if (overlap > 0.3) { // At least 30% overlap
        ridesWithOverlap.push({
          ...ride,
          routeOverlap: overlap,
          matchScore: Math.round(overlap * 100)
        });
      }
    }

    return ridesWithOverlap.sort((a, b) => b.routeOverlap - a.routeOverlap);
  }

  /**
   * Calculate route overlap between two routes
   * @param {object} route1Start - Start coordinates of route 1
   * @param {object} route1End - End coordinates of route 1
   * @param {object} route2Start - Start coordinates of route 2
   * @param {object} route2End - End coordinates of route 2
   * @param {number} radiusKm - Proximity radius
   * @returns {number} Overlap ratio (0 to 1)
   */
  static calculateRouteOverlap(route1Start, route1End, route2Start, route2End, radiusKm) {
    // Simple overlap calculation based on start and end proximity
    let overlapPoints = 0;

    // Check if starts are close
    if (MapboxService.isWithinRadius(route1Start, route2Start, radiusKm)) {
      overlapPoints++;
    }

    // Check if ends are close
    if (MapboxService.isWithinRadius(route1End, route2End, radiusKm)) {
      overlapPoints++;
    }

    // Check if route 1 start is near route 2 path
    const route1StartToRoute2End = MapboxService.calculateDistance(route1Start, route2End);
    const route2Length = MapboxService.calculateDistance(route2Start, route2End);
    if (route1StartToRoute2End < route2Length + radiusKm) {
      overlapPoints += 0.5;
    }

    return Math.min(overlapPoints / 2, 1); // Normalize to 0-1
  }

  /**
   * Text similarity using simple matching
   * @param {string} text1
   * @param {string} text2
   * @returns {number} Similarity score (0 to 1)
   */
  static textSimilarity(text1, text2) {
    const t1 = text1.toLowerCase().trim();
    const t2 = text2.toLowerCase().trim();

    if (t1 === t2) return 1;
    if (t1.includes(t2) || t2.includes(t1)) return 0.8;

    // Simple word overlap
    const words1 = t1.split(/\s+/);
    const words2 = t2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));

    return commonWords.length / Math.max(words1.length, words2.length);
  }

  /**
   * Get nearby pickup/drop points for a location
   * @param {object} coordinates - { longitude, latitude }
   * @param {number} radiusKm - Search radius
   * @returns {Promise<object>} Nearby rides grouped by type
   */
  static async getNearbyPoints(coordinates, radiusKm = 10) {
    const Ride = require('../models/Ride');

    const [pickupPoints, dropPoints] = await Promise.all([
      // Rides starting nearby
      Ride.find({
        status: 'pending',
        sourceCoordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [coordinates.longitude, coordinates.latitude]
            },
            $maxDistance: radiusKm * 1000
          }
        }
      })
        .select('source sourceCoordinates destination destinationCoordinates dateTime price')
        .limit(10)
        .lean(),

      // Rides ending nearby
      Ride.find({
        status: 'pending',
        destinationCoordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [coordinates.longitude, coordinates.latitude]
            },
            $maxDistance: radiusKm * 1000
          }
        }
      })
        .select('source sourceCoordinates destination destinationCoordinates dateTime price')
        .limit(10)
        .lean()
    ]);

    return {
      pickupPoints,
      dropPoints
    };
  }
}

module.exports = RideMatchingService;
