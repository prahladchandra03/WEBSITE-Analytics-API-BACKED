const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  // Extract token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided or invalid token format" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token part

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Token validation error:", err);

    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Generic error for other issues
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = isAuthenticated;