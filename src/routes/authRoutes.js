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

router.post("/auth/registerApp", authController.registerApp);
router.get("/auth/getApiKey", authController.getApiKey);
router.post("/auth/revokeApiKey", authController.revokeApiKey);
router.get("/auth/failure", authController.authFailure);

module.exports = router;