const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const isAuthenticated = require("../middleware/isAuthenticated");
const { validateRegisterApp } = require("../middleware/validateInput");

const router = express.Router();

// Google OAuth Routes
router.get(
    "/google/login",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/api/auth/failure" }),
    authController.googleCallback
);

// API Key Management Routes
router.post('/register-app', validateRegisterApp, authController.registerApp);
router.get('/api-key', isAuthenticated, authController.getApiKey);
router.post('/revoke-api-key', isAuthenticated, authController.revokeApiKey);

// Failure Route
router.get('/failure', authController.authFailure);

module.exports = router;