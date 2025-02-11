const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    requires: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
