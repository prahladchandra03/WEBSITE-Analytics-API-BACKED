const APIKey = require("../models/apiKey");

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ message: "API key is required" });
  }

  try {
    const validKey = await APIKey.findOne({ apiKey });
    if (!validKey) {
      return res.status(401).json({ message: "Invalid API key" });
    }

    // Check if the API key has expired
    if (validKey.expiresAt < new Date()) {
      return res.status(401).json({ message: "API key has expired" });
    }

    req.appId = validKey.appId; // Attach appId to the request object
    next();
  } catch (err) {
    console.error("Error verifying API key:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authenticateApiKey;
