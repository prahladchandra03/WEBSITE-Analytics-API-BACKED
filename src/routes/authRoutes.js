const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const isAuthenticated = require("../middleware/isAuthenticated");
const { validateRegisterApp } = require("../middleware/validateInput");

const router = express.Router();

// Google OAuth Routes
router.get(
    "/auth/google/login",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/failure" }),
    authController.googleCallback
);

// API Key Management Routes
router.post('/auth/register-app', isAuthenticated, validateRegisterApp, authController.registerApp);
router.get('/auth/api-key', isAuthenticated, authController.getApiKey);
router.post('/auth/revoke-api-key', isAuthenticated, authController.revokeApiKey);

// Failure Route
router.get('/auth/failure', authController.authFailure);

module.exports = router;