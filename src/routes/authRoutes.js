const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const isAuthenticated = require("../middleware/isAuthenticated");
const { validateRegisterApp } = require("../middleware/validateInput");
const { generateToken } = require('../middleware/isAuthenticated');



const router = express.Router();

// Example usage when user logs in
router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  
  if (!user || !user.isPasswordValid(req.body.password)) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user); // Generate a token
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
router.post('/auth/register-app', isAuthenticated, validateRegisterApp, authController.registerApp);
router.get('/auth/api-key', isAuthenticated, authController.getApiKey);
router.post('/auth/revoke-api-key', isAuthenticated, authController.revokeApiKey);

// Failure Route
router.get('/auth/failure', authController.authFailure);

module.exports = router;