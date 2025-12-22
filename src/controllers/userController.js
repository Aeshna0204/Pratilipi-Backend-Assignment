const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.userBorrowedBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const [data, total] = await Promise.all([
      prisma.borrowEvent.findMany({
        where: { userId: req.user.userId },
        include: { book: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { borrowedAt: "desc" }
      }),
      prisma.borrowEvent.count({ where: { userId: req.user.userId } })
    ]);

    res.json({ success: true, data, total, page, limit });
  } catch (err) { next(err); }
};
