const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema({
  appName: {
    type: String,
    required: true,
  },
  appUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("APIKey", apiKeySchema);
