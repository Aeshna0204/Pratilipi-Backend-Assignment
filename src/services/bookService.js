const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Borrow a book safely with row-level locking
 * Ensures that two users cannot borrow the same book concurrently
 */
exports.borrowBook = async (bookId, userId) => {
  if (isNaN(bookId)) throw { status: 400, message: "Invalid book ID" };

  return await prisma.$transaction(async (tx) => {
    // Lock the book row for this transaction
    const book = await tx.$queryRawUnsafe(
      `SELECT * FROM "Book" WHERE id = $1 FOR UPDATE`,
      bookId
    );

    if (!book[0]) throw { status: 404, message: "Book not found" };
    if (book[0].status === "borrowed") throw { status: 400, message: "Book already borrowed" };

    // Update book status
    await tx.book.update({
      where: { id: bookId },
      data: { status: "borrowed" }
    });

    // Create borrow event
    const borrowEvent = await tx.borrowEvent.create({
      data: { userId, bookId }
    });

    return borrowEvent;
  }, {
    isolationLevel: "Serializable" // Optional, strongest isolation to avoid race conditions
  });
};
