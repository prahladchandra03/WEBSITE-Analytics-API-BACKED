const APIKey = require("../models/apiKey");
const generateApiKey = require("../utils/apiKeyGenerator");

/**
 * Google OAuth callback handler
 */
exports.googleCallback = (req, res) => {
  console.log("User authenticated:", req.user); // Debug log
  res.redirect("https://website-analytics-api-1.onrender.com/api-docs");
};








/**
 * Register a new app and generate an API key
 */
exports.registerApp = async (req, res) => {
  const { appName, appUrl } = req.body;

  // Validate required parameters
  if (!appName || !appUrl) {
    return res.status(400).json({ message: "appName and appUrl are required" });
  }

  // Ensure the user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Check if the app is already registered
    const existingApp = await APIKey.findOne({ appUrl, userId: req.user.id });
    if (existingApp) {
      return res.status(400).json({ message: "App already registered" });
    }

    // Generate a new API key and save it
    const newAPIKey = new APIKey({
      appName,
      appUrl,
      userId: req.user.id,
      apiKey: generateApiKey(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiration
    });

    const savedAPIKey = await newAPIKey.save();
    res.status(201).json({ apiKey: savedAPIKey.apiKey, message: "API Key generated successfully" });
  } catch (err) {
    console.error("Error registering app:", err);
    res.status(500).json({ message: "Error registering app", error: err.message });
  }
};

/**
 * Retrieve the API key for the authenticated user
 */
exports.getApiKey = async (req, res) => {
  try {
    const apiKey = await APIKey.findOne({ userId: req.user.id });
    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }
    res.json({ apiKey: apiKey.apiKey });
  } catch (err) {
    console.error("Error fetching API key:", err);
    res.status(500).json({ message: "Error fetching API key", error: err.message });
  }
};

/**
 * Revoke an API key
 */
exports.revokeApiKey = async (req, res) => {
  const { apiKey } = req.body;

  // Validate required parameters
  if (!apiKey) {
    return res.status(400).json({ message: "API key is required" });
  }

  try {
    // Find and delete the API key
    const deletedKey = await APIKey.findOneAndDelete({
      apiKey,
      userId: req.user.id,
    });

    if (!deletedKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    res.json({ message: "API key revoked successfully" });
  } catch (err) {
    console.error("Error revoking API key:", err);
    res.status(500).json({ message: "Error revoking API key", error: err.message });
  }
};

/**
 * Handle Google OAuth failure
 */
exports.authFailure = (req, res) => {
  res.status(400).json({ message: "Google OAuth failed" });
};