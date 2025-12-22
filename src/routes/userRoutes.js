const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { userBorrowedBooks } = require("../controllers/userController");

router.use(auth);
router.get("/borrowed", userBorrowedBooks);

module.exports = router;
