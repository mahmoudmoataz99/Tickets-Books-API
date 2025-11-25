const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
});

// Ensure unique username and email during registration
userSchema.pre('save', async function (next) {
  const User = mongoose.model('User', userSchema);
  const existingUsername = await User.findOne({ username: this.username });
  if (existingUsername) {
    const error = new Error('Username already exists');
    return next(error);
  }

  const existingEmail = await User.findOne({ email: this.email });
  if (existingEmail) {
    const error = new Error('Email already exists');
    return next(error);
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
