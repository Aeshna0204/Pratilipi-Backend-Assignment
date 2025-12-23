const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bookService = require("../services/bookService");

exports.listBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    // const where = status ? { status } : {};
     const where = {
      deletedAt: null,        // exclude soft-deleted books
      ...(status && { status })
    };
    const [data, total] = await Promise.all([
      prisma.book.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.book.count({ where })
    ]);

    res.json({ success: true, data, total, page, limit });
  } catch (err) { next(err); }
};


exports.viewBook = async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id);
    if (isNaN(bookId)) {
      return res.status(400).json({ success: false, message: "Invalid book id" });
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    if (book.deletedAt) {
      return res.status(410).json({ // 410 Gone is semantically correct
        success: false,
        message: "Book has been deleted"
      });
    }

    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};


exports.borrowBook = async (req, res, next) => {
  try {
    const borrowEvent = await bookService.borrowBook(
      parseInt(req.params.id),
      req.user.userId
    );
    res.status(201).json({ success: true, data: borrowEvent, message: "Book borrowed successfully" });
  } catch (err) {
    next(err);
  }
};