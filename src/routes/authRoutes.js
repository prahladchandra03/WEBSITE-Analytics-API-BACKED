const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const isAuthenticated = require("../middleware/isAuthenticated");
const { validateRegisterApp } = require("../middleware/validateInput");




const router = express.Router();

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

router.post("/auth/registerApp", validateRegisterApp, authController.registerApp);

console.log(typeof authController.getApiKey); // Should log "function"
console.log(typeof isAuthenticated); // Should log "function"
router.get("/auth/getApiKey", isAuthenticated, authController.getApiKey);
router.post("/auth/revokeApiKey", isAuthenticated, authController.revokeApiKey);
module.exports = router;