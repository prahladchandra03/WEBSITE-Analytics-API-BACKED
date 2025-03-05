const { body, validationResult } = require("express-validator");

const validateRegisterApp = [
  body("appName").notEmpty().withMessage("appName is required"),
  body("appUrl").isURL().withMessage("appUrl must be a valid URL"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateRegisterApp };
