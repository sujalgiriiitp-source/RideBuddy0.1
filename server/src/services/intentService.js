const { StatusCodes } = require('http-status-codes');
const TravelIntent = require('../models/TravelIntent');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const NotificationService = require('./notificationService');

const getRouteRegex = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return null;
  }
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
};

const formatDateTimeForNotification = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'soon';
  }
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const getVehicleOwners = async ({ excludeUserId }) => {
  return User.find({
    _id: { $ne: excludeUserId },
    vehicleBrand: { $exists: true, $ne: '' }
  })
    .select('_id name fcmToken')
    .lean();
};

const createIntent = async ({ userId, source, destination, dateTime }) => {
  const requester = await User.findById(userId).select('name').lean();
  if (!requester) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const intent = await TravelIntent.create({
    userId,
    source,
    destination,
    dateTime,
    status: 'open',
    responses: []
  });

  const drivers = await getVehicleOwners({ excludeUserId: userId });
  const driverIds = drivers.map((driver) => String(driver._id));

  if (driverIds.length > 0) {
    const title = '🚗 Ride Request Near You!';
    const body = `${requester.name} wants to go from ${source} to ${destination} at ${formatDateTimeForNotification(
      dateTime
    )}. Can you help?`;
    const data = {
      type: 'INTENT_REQUEST',
      intentId: String(intent._id)
    };

    await Promise.all([
      Notification.insertMany(
        driverIds.map((driverId) => ({
          userId: driverId,
          type: 'INTENT_REQUEST',
          title,
          body,
          data,
          isRead: false
        }))
      ),
      NotificationService.sendToUsers(driverIds, { title, body, data })
    ]);

    intent.responses = driverIds.map((driverId) => ({
      driverId,
      status: 'pending',
      createdAt: new Date()
    }));
    await intent.save();
  }

  return TravelIntent.findById(intent._id)
    .populate('userId', 'name email phone')
    .populate('responses.driverId', 'name phone vehicleBrand vehicleModel numberPlate');
};

const getIntents = async ({ source, destination, date, excludeUserId }) => {
  const query = { status: 'open' };

  if (excludeUserId) {
    query.userId = { $ne: excludeUserId };
  }

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
    query.dateTime = { $gte: startDate, $lt: endDate };
  }

  return TravelIntent.find(query)
    .populate('userId', 'name email phone')
    .populate('responses.driverId', 'name phone vehicleBrand vehicleModel numberPlate')
    .sort({ dateTime: 1 });
};

const getNearbyIntents = async ({ userId, source, destination, lookAheadHours = 24 }) => {
  const query = {
    status: 'open',
    userId: { $ne: userId }
  };

  const now = new Date();
  const endTime = new Date(now);
  endTime.setHours(endTime.getHours() + Number(lookAheadHours));
  query.dateTime = { $gte: now, $lte: endTime };

  const sourceRegex = getRouteRegex(source);
  const destinationRegex = getRouteRegex(destination);

  if (sourceRegex || destinationRegex) {
    query.$and = [];
    if (sourceRegex) {
      query.$and.push({ source: sourceRegex });
    }
    if (destinationRegex) {
      query.$and.push({ destination: destinationRegex });
    }
  }

  return TravelIntent.find(query)
    .populate('userId', 'name email phone')
    .sort({ dateTime: 1 })
    .lean();
};

const getMyIntents = async ({ userId }) => {
  return TravelIntent.find({ userId })
    .populate('responses.driverId', 'name phone vehicleBrand vehicleModel numberPlate')
    .populate('matchedDriverId', 'name phone vehicleBrand vehicleModel numberPlate')
    .populate('conversationId')
    .sort({ createdAt: -1 });
};

const ensureDriverCanRespond = async (driverId) => {
  const driver = await User.findById(driverId).select('name vehicleBrand vehicleModel numberPlate');
  if (!driver) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (!driver.vehicleBrand || !String(driver.vehicleBrand).trim()) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only users with vehicle details can respond to intents');
  }

  return driver;
};

const upsertDriverResponse = (intent, driverId, status) => {
  const existingIndex = intent.responses.findIndex(
    (response) => String(response.driverId) === String(driverId)
  );

  if (existingIndex >= 0) {
    intent.responses[existingIndex].status = status;
    if (!intent.responses[existingIndex].createdAt) {
      intent.responses[existingIndex].createdAt = new Date();
    }
    return;
  }

  intent.responses.push({
    driverId,
    status,
    createdAt: new Date()
  });
};

const createConversationForIntent = async ({ intentId, passengerId, driverId, source, destination }) => {
  let conversation = await Conversation.findOne({
    intentId,
    participants: { $all: [passengerId, driverId] },
    $expr: { $eq: [{ $size: '$participants' }, 2] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      intentId,
      rideId: null,
      participants: [passengerId, driverId],
      lastMessage: {
        text: 'Ride intent accepted. Start coordinating your trip.',
        senderId: driverId,
        timestamp: new Date(),
        messageType: 'system'
      }
    });

    await Message.create({
      conversationId: conversation._id,
      senderId: driverId,
      messageType: 'system',
      content: `Ride intent accepted for ${source} → ${destination}.`,
      metadata: {
        systemType: 'intent_matched',
        data: { intentId: String(intentId) }
      },
      readBy: [{ userId: driverId, readAt: new Date() }]
    });
  }

  return conversation;
};

const respondToIntent = async ({ intentId, driverId, action }) => {
  const normalizedAction = String(action || '').toLowerCase();
  if (!['accept', 'decline'].includes(normalizedAction)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'action must be accept or decline');
  }

  const [intent, driver] = await Promise.all([
    TravelIntent.findById(intentId),
    ensureDriverCanRespond(driverId)
  ]);

  if (!intent) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Travel intent not found');
  }

  if (String(intent.userId) === String(driverId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot respond to your own intent');
  }

  if (normalizedAction === 'decline') {
    upsertDriverResponse(intent, driverId, 'declined');
    if (intent.status !== 'matched') {
      intent.status = 'open';
    }
    await intent.save();
    return { intent, conversationId: null };
  }

  if (intent.status === 'matched' && String(intent.matchedDriverId) !== String(driverId)) {
    throw new ApiError(StatusCodes.CONFLICT, 'This intent is already matched');
  }

  upsertDriverResponse(intent, driverId, 'accepted');
  intent.status = 'matched';
  intent.matchedDriverId = driverId;

  const conversation = await createConversationForIntent({
    intentId: intent._id,
    passengerId: intent.userId,
    driverId,
    source: intent.source,
    destination: intent.destination
  });
  intent.conversationId = conversation._id;
  await intent.save();

  const title = 'Driver accepted your request!';
  const body = `${driver.name} accepted your ride request to ${intent.destination}. Tap to open chat.`;
  const data = {
    type: 'RIDE_ACCEPTED',
    intentId: String(intent._id),
    conversationId: String(conversation._id)
  };

  await Promise.all([
    Notification.create({
      userId: intent.userId,
      type: 'RIDE_ACCEPTED',
      title,
      body,
      data,
      isRead: false
    }),
    NotificationService.sendToUsers([intent.userId], { title, body, data })
  ]);

  return { intent, conversationId: conversation._id };
};

const cancelIntent = async ({ intentId, userId }) => {
  const intent = await TravelIntent.findOne({ _id: intentId, userId });
  if (!intent) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Travel intent not found');
  }

  if (intent.status === 'matched') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Matched intents cannot be cancelled');
  }

  intent.status = 'expired';
  await intent.save();
  return intent;
};

module.exports = {
  createIntent,
  getIntents,
  getNearbyIntents,
  getMyIntents,
  respondToIntent,
  cancelIntent
};
