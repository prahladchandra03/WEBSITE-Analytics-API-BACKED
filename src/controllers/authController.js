const jwt = require("jsonwebtoken"); // Import JWT module
const APIKey = require("../models/apiKey");
const generateApiKey = require("../utils/apiKeyGenerator");

exports.googleCallback = (req, res) => {
  console.log("User authenticated:", req.user); // Debug log
  
  // Generate JWT token after successful authentication
  const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Set token expiration time
  });

  // Send the JWT token to the user
  res.json({
    message: "Authentication successful",
    token: token, // Send the JWT token back to the frontend
  });
};

// Register App Route (with JWT Authentication)
exports.registerApp = async (req, res) => {
  const { appName, appUrl } = req.body;

  if (!appName || !appUrl) {
    return res.status(400).json({ message: "appName and appUrl are required" });
  }

  // Check if the user is authenticated by verifying the JWT token
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from 'Authorization' header
  if (!token) {
    return res.status(401).json({ message: "User not authenticated, token missing" });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Extract userId from the token

    // Proceed to register the app
    const existingApp = await APIKey.findOne({ appUrl });
    if (existingApp) {
      return res.status(400).json({ message: "App already registered" });
    }

    const newAPIKey = new APIKey({
      appName,
      appUrl,
      userId: userId, // Use userId from JWT token
      apiKey: generateApiKey(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    const savedAPIKey = await newAPIKey.save();
    res.status(201).json({ apiKey: savedAPIKey.apiKey });
  } catch (err) {
    console.error("Error registering app:", err);
    res.status(500).json({ message: "Error registering app", error: err.message });
  }
};

exports.getApiKey = async (req, res) => {
  // Check if the user is authenticated by verifying the JWT token
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from 'Authorization' header
  if (!token) {
    return res.status(401).json({ message: "User not authenticated, token missing" });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Extract userId from the token

    // Fetch the API key for the authenticated user
    const apiKey = await APIKey.findOne({ userId });
    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }
    res.json({ apiKey: apiKey.apiKey });
  } catch (err) {
    console.error("Error fetching API key:", err);
    res.status(500).json({ message: "Error fetching API key", error: err.message });
  }
};

exports.revokeApiKey = async (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ message: "API key is required" });
  }

  // Check if the user is authenticated by verifying the JWT token
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from 'Authorization' header
  if (!token) {
    return res.status(401).json({ message: "User not authenticated, token missing" });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Extract userId from the token

    // Proceed to revoke the API key for the authenticated user
    const deletedKey = await APIKey.findOneAndDelete({
      apiKey,
      userId: userId, // Use userId from JWT token
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

exports.authFailure = (req, res) => {
  res.status(400).json({ message: "Google OAuth failed" });
};
