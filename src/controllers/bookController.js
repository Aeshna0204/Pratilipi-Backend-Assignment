const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bookService = require("../services/bookService");

exports.listBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const where = status ? { status } : {};
    const [data, total] = await Promise.all([
      prisma.book.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.book.count({ where })
    ]);

    res.json({ success: true, data, total, page, limit });
  } catch (err) { next(err); }
};


exports.viewBook=async (req, res, next) => {
    try {
        const book_id=parseInt(req.params.id);
        const book=await prisma.book.findUnique({where:{id:book_id}});
        if(!book){
            return res.status(404).json({success:false,message:"Book not found"});
        }
        res.json({success:true,data:book});

    }catch(err){next(err);}
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