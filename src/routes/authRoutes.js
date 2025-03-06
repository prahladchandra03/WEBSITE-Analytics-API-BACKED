const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const isAuthenticated = require("../middleware/isAuthenticated");
const { validateRegisterApp } = require("../middleware/validateInput");

const jwt = require("jsonwebtoken");

router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  // Validate user credentials (e.g., check against database)
  const user = { id: 1, email: "user@example.com" }; // Example user

  // Generate a JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h", // Token expiration time
    }
  );

  // Send the token in the response
  res.json({ token });
});

// Google OAuth Routes
router.get(
  "/auth/google/login", // Fixed: Removed the "=" sign
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }), // Fixed: Removed "/api" prefix
  authController.googleCallback
);

// API Key Management Routes

router.post(
  "/auth/registerApp",
  validateRegisterApp,
  authController.registerApp
);

console.log(typeof authController.getApiKey); // Should log "function"
console.log(typeof isAuthenticated); // Should log "function"
router.get("/auth/getApiKey", isAuthenticated, authController.getApiKey);
router.post("/auth/revokeApiKey", isAuthenticated, authController.revokeApiKey);
module.exports = router;
