const express = require("express");
const router = express.Router();
const { register, login, registerUser } = require("../controllers/authController");
const { registerValidation, loginValidation } = require("../utils/validators");
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

router.post("/register", registerValidation, validate, registerUser);
router.post("/login", loginValidation, validate, login);

module.exports = router;
