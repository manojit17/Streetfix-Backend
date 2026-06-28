// ─────────────────────────────────────────────────────────────
//  models/User.js
//  PURPOSE : Define the shape of a User document in MongoDB
//  FIELDS  : name, email, password, createdAt
// ─────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type     : String,
      required : [true, 'Please provide a name'],
      trim     : true,          // removes extra spaces
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },

    email: {
      type     : String,
      required : [true, 'Please provide an email'],
      unique   : true,           // no two users with same email
      lowercase: true,           // always store as lowercase
      match    : [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },

    password: {
      type     : String,
      required : [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select   : false,          // never return password in queries by default
    },
  

   avatar: {
      type     : String,
      default  : null, // ✅ URL to profile image stored on Cloudinary
    },
  },
  {
    timestamps: true,
  }
);


// ── PRE-SAVE HOOK ─────────────────────────────────────────────
// Runs BEFORE a user document is saved to the database
// Hashes the password so we never store plain text
UserSchema.pre('save', async function (next) {
  // Only hash if the password was changed (or is new)
  if (!this.isModified('password')) return next();

  // bcrypt generates a "salt" (random string) and hashes the password
  const salt    = await bcrypt.genSalt(10); // 10 = work factor (higher = slower but safer)
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── INSTANCE METHOD ───────────────────────────────────────────
// Lets us call user.matchPassword(enteredPassword) anywhere
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // bcrypt.compare hashes enteredPassword and compares it to stored hash
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
