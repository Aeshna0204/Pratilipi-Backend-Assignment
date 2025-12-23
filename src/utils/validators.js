const { body } = require("express-validator");

exports.registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars")
];

exports.loginValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required")
];

exports.bookValidation = [
  body("title").notEmpty().withMessage("Title required"),
  body("author").notEmpty().withMessage("Author required"),
  body("genre").notEmpty().withMessage("Genre required"),
  body("status")
    .optional()
    .isIn(["available", "borrowed"])
    .withMessage("Status must be either 'available' or 'borrowed'")
];
exports.patchBookValidation = [
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Title cannot be empty"),

  body("author")
    .optional()
    .notEmpty()
    .withMessage("Author cannot be empty"),

  body("genre")
    .optional()
    .notEmpty()
    .withMessage("Genre cannot be empty"),

  body("status")
    .optional()
    .isIn(["available", "borrowed"])
    .withMessage("Status must be either 'available' or 'borrowed'")
];