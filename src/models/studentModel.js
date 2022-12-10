//=====================Importing mongoose package=====================//
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

//===================== Creating user Schema =========================//
const studentSchema = new mongoose.Schema({

  studentName: { type: String, required: true, trim: true },

  subject: { type: String, required: true, trim: true },

  marks: { type: Number, required: true, trim: true },

  userId: { type: ObjectId, refs: "User", required: true },

  isDeleted: { type: Boolean, default: false },

  deletedAt: { type: Date }

}, { timestamps: true });


//===================== Exporting user model =========================//
module.exports = mongoose.model("Student", studentSchema)