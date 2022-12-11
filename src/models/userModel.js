//=====================Importing mongoose package=====================//
const mongoose = require("mongoose");

//===================== Creating user Schema =========================//
const userSchema = new mongoose.Schema({
  fname: { type: String, required: true, trim: true },

  lname: { type: String, required: true, trim: true },

  profileImage: { type: String, required: true, trim: true },

  email: { type: String, required: true, lowercase: true, unique: true, trim: true },

  phone: { type: String, required: true, unique: true, trim: true },

  password: { type: String, required: true, trim: true, min: 8, max: 15 },    // encrypted password

}, { timestamps: true });


//===================== Exporting user model =========================//
module.exports = mongoose.model("User", userSchema)