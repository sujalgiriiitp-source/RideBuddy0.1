const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['user', 'driver', 'admin'],
      default: 'user'
    },
    phone: {
      type: String,
      trim: true
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Auto', 'Bike'],
      trim: true,
      default: ''
    },
    vehicleBrand: {
      type: String,
      trim: true,
      default: ''
    },
    vehicleModel: {
      type: String,
      trim: true,
      default: ''
    },
    vehicleColor: {
      type: String,
      trim: true,
      default: ''
    },
    numberPlate: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    profilePhoto: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $exists: true, $gt: '' }
    }
  }
);

module.exports = mongoose.model('User', userSchema);
