const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { listBooks, borrowBook , viewBook } = require("../controllers/bookController");

router.use(auth);
router.get("/", listBooks);
router.post("/:id/borrow", borrowBook);
router.get("/:id/view", viewBook);

module.exports = router;
