const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "admin"
      }
    });

    res.status(201).json({
      success: true,
      data: { id: admin.id, name: admin.name, email: admin.email },
      message: "Admin created successfully"
    });
  } catch (err) {
    if (err.code === "P2002") {
      err.status = 400;
      err.message = "Email already exists";
    }
    next(err);
  }
};


exports.addBook = async (req, res, next) => {
  try {
    const book = await prisma.book.create({ data: req.body });
    res.status(201).json({ success: true, data: book, message: "Book added" });
  } catch (err) { next(err); }
};

exports.updateBook = async (req, res, next) => {
  try {
    const book = await prisma.book.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json({ success: true, data: book, message: "Book updated" });
  } catch (err) { err.status = 404; next(err); }
};


exports.updateSpecificBookDetails = async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id);
    if (isNaN(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    // Remove undefined fields
    const updateData = {};
    const allowedFields = ["title", "author", "genre", "status"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    // // Check book exists & not soft-deleted
    // const book = await prisma.book.findFirst({
    //   where: { id: bookId, deletedAt: null }
    // });

    // if (!book) {
    //   return res.status(404).json({ message: "Book not found or deleted" });
    // }

    // Optional business rule: prevent marking borrowed book as available directly
    // if (
    //   book.status === "borrowed" &&
    //   updateData.status === "available"
    // ) {
    //   return res.status(400).json({
    //     message: "Cannot mark a borrowed book as available directly"
    //   });
    // }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedBook,
      message: "Book updated successfully"
    });

  } catch (err) {
    next(err);
  }
};


exports.deleteBook = async (req, res, next) => {
  try {
    await prisma.book.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: "Book deleted" });
  } catch (err) { err.status = 404; next(err); }
};

exports.listBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const [data, total] = await Promise.all([
      prisma.book.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.book.count()
    ]);
    res.json({ success: true, data, total, page, limit });
  } catch (err) { next(err); }
};

exports.borrowLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [data, total] = await Promise.all([
      prisma.borrowEvent.findMany({ include: { user: true, book: true }, skip: (page - 1) * limit, take: limit }),
      prisma.borrowEvent.count()
    ]);
    res.json({ success: true, data, total, page, limit });
  } catch (err) { next(err); }
};
