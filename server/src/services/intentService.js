const TravelIntent = require('../models/TravelIntent');
const Ride = require('../models/Ride');

const createIntent = async ({ userId, source, destination, dateTime }) => {
  return TravelIntent.create({
    user: userId,
    source,
    destination,
    dateTime
  });
};

const getIntents = async ({ source, destination, date }) => {
  const query = {};

  if (source) {
    query.source = { $regex: source, $options: 'i' };
  }

  if (destination) {
    query.destination = { $regex: destination, $options: 'i' };
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    query.dateTime = {
      $gte: startDate,
      $lt: endDate
    };
  }

  return TravelIntent.find(query).populate('user', 'name email phone').sort({ dateTime: 1 });
};

const getMatches = async ({ userId, source, destination, dateTime }) => {
  let intentSource = source;
  let intentDestination = destination;
  let intentDateTime = dateTime;

  if (!intentSource || !intentDestination || !intentDateTime) {
    const latestIntent = await TravelIntent.findOne({ user: userId }).sort({ createdAt: -1 });

    if (!latestIntent) {
      return [];
    }

    intentSource = latestIntent.source;
    intentDestination = latestIntent.destination;
    intentDateTime = latestIntent.dateTime;
  }

  const startWindow = new Date(intentDateTime);
  startWindow.setHours(startWindow.getHours() - 3);

  const endWindow = new Date(intentDateTime);
  endWindow.setHours(endWindow.getHours() + 3);

  return Ride.find({
    source: { $regex: intentSource, $options: 'i' },
    destination: { $regex: intentDestination, $options: 'i' },
    dateTime: {
      $gte: startWindow,
      $lte: endWindow
    },
    seatsAvailable: { $gt: 0 }
  })
    .populate('createdBy', 'name email phone')
    .sort({ dateTime: 1 });
};

module.exports = {
  createIntent,
  getIntents,
  getMatches
};
