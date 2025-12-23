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





exports.updateSpecificBookDetails = async (req, res, next) => {
  const bookId = parseInt(req.params.id);

  if (isNaN(bookId)) {
    return res.status(400).json({ message: "Invalid book id" });
  }

  try {
    const updatedBook = await prisma.$transaction(async (tx) => {
      //  Lock the book row for update
      const book = await tx.$queryRaw`
        SELECT * FROM "Book"
        WHERE "id" = ${bookId} AND "deletedAt" IS NULL
        FOR UPDATE
      `;

      if (!book || book.length === 0) {
        throw { status: 404, message: "Book not found or deleted" };
      }

      const currentBook = book[0];

      //  prevent updating borrowed book
      if (currentBook.status === "borrowed") {
        throw { status: 400, message: "Cannot update a borrowed book" };
      }

      // Remove undefined fields from request
      const updateData = {};
      const allowedFields = ["title", "author", "genre", "status"];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      if (Object.keys(updateData).length === 0) {
        throw { status: 400, message: "No valid fields provided for update" };
      }

      //  Optional: prevent marking borrowed book as available
      if (currentBook.status === "borrowed" && updateData.status === "available") {
        throw { status: 400, message: "Cannot mark a borrowed book as available directly" };
      }

      // Update book
      const updated = await tx.book.update({
        where: { id: bookId },
        data: updateData
      });

      return updated;
    });

    res.json({
      success: true,
      data: updatedBook,
      message: "Book updated successfully"
    });

  } catch (err) {
    if (err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
};





exports.softDeleteBook = async (req, res, next) => {
  const bookId = parseInt(req.params.id);

  try {
    await prisma.$transaction(async (tx) => {
      // Lock the book row
      const book = await tx.$queryRaw`
        SELECT * FROM "Book"
        WHERE "id" = ${bookId} AND "deletedAt" IS NULL
        FOR UPDATE
      `;

      if (!book || book.length === 0) {
        throw { status: 404, message: "Book not found or already deleted" };
      }

      if (book[0].status === "borrowed") {
        throw { status: 400, message: "Cannot delete: Book is currently borrowed" };
      }

      await tx.book.update({
        where: { id: bookId },
        data: { deletedAt: new Date() }
      });
    });

    res.json({ success: true, message: "Book soft-deleted successfully" });

  } catch (err) {
    if (err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
};


exports.listBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const [data, total] = await Promise.all([
      prisma.book.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        where: { deletedAt: null } // <-- exclude deleted
      }),
      prisma.book.count({ where: { deletedAt: null } })
    ]);

    res.json({ success: true, data, total, page, limit });
  } catch (err) { next(err); }
};

exports.borrowLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const [data, total] = await Promise.all([
      prisma.borrowEvent.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              genre: true,
              status: true
            }
          }
        }
        , skip: (page - 1) * limit, take: limit
      }),
      prisma.borrowEvent.count()
    ]);
    res.json({ success: true, data, total, page, limit });
  } catch (err) { next(err); }
};
