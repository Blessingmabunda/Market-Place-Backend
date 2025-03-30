const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String
  },
  loginHistory: {
    type: [Date],
    default: []
  }
}, {
  timestamps: true // Keeps createdAt and updatedAt fields
});

// Virtual id getter to match Sequelize's id behavior
UserSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are included when converting to JSON
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;