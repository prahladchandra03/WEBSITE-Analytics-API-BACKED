const { body, validationResult } = require("express-validator");

const validateRegisterApp = [
  // Validate appName
  body("appName")
    .notEmpty()
    .withMessage("appName is required")
    .trim() // Remove extra spaces
    .escape(), // Sanitize to prevent XSS attacks

  // Validate appUrl
  body("appUrl")
    .notEmpty()
    .withMessage("appUrl is required")
    .isURL()
    .withMessage("appUrl must be a valid URL")
    .trim() // Remove extra spaces
    .normalizeEmail(), // Normalize the URL

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);

    // If there are validation errors, return a 400 response with the errors
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(), // Return array of validation errors
      });
    }

    // If validation passes, proceed to the next middleware or route handler
    next();
  },
];

module.exports = { validateRegisterApp };