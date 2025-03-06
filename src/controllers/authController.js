const APIKey = require("../models/apiKey");
const generateApiKey = require("../utils/apiKeyGenerator");

exports.googleCallback = (req, res) => {
  console.log("User authenticated:", req.user); // Debug log
  res.redirect("https://website-analytics-api-1.onrender.com/api-docs");
};

exports.registerApp = async (req, res) => {
  const { appName, appUrl } = req.body;

  if (!appName || !appUrl) {
    return res.status(400).json({ message: "appName and appUrl are required" });
  }

  // Check if the user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const existingApp = await APIKey.findOne({ appUrl });
    if (existingApp) {
      return res.status(400).json({ message: "App already registered" });
    }

    const newAPIKey = new APIKey({
      appName,
      appUrl,
      userId: req.user.id, // Ensure req.user.id is defined
      apiKey: generateApiKey(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    const savedAPIKey = await newAPIKey.save();
    res.status(201).json({ apiKey: savedAPIKey.apiKey });
  } catch (err) {
    console.error("Error registering app:", err);
    res
      .status(500)
      .json({ message: "Error registering app", error: err.message });
  }
};

exports.getApiKey = async (req, res) => {
  try {
    const apiKey = await APIKey.findOne({ userId: req.user.id }); // Use req.user.id
    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }
    res.json({ apiKey: apiKey.apiKey });
  } catch (err) {
    console.error("Error fetching API key:", err);
    res
      .status(500)
      .json({ message: "Error fetching API key", error: err.message });
  }
};

exports.revokeApiKey = async (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ message: "API key is required" });
  }

  try {
    const deletedKey = await APIKey.findOneAndDelete({
      apiKey,
      userId: req.user.id, // Use req.user.id
    });
    if (!deletedKey) {
      return res.status(404).json({ message: "API key not found" });
    }
    res.json({ message: "API key revoked successfully" });
  } catch (err) {
    console.error("Error revoking API key:", err);
    res
      .status(500)
      .json({ message: "Error revoking API key", error: err.message });
  }
};


exports.authFailure = (req, res) => {
  res.status(400).json({ message: "Google OAuth failed" });
};
