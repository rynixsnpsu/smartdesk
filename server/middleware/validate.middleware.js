const { body, validationResult } = require("express-validator");

exports.validateFeedback = [
  body("topic").trim().isLength({ min: 3 }),
  body("description").trim().isLength({ min: 5 }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send("Invalid input");
    }
    next();
  }
];
