const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const { addBook, updateBook, deleteBook,softDeleteBook, listBooks, borrowLogs,registerAdmin,updateSpecificBookDetails } = require("../controllers/adminController");
const { bookValidation ,registerValidation,patchBookValidation} = require("../utils/validators");
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

router.use(auth, role("admin"));
router.post("/register-admin", registerValidation, validate, registerAdmin);
router.post("/books", bookValidation, validate, addBook);
router.patch("/books/:id",patchBookValidation,validate,updateSpecificBookDetails);

// Soft delete book
router.delete("/books/:id", softDeleteBook);
router.get("/books", listBooks);
router.get("/borrow-events", borrowLogs);

module.exports = router;
