-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Book_status_idx" ON "Book"("status");

-- CreateIndex
CREATE INDEX "Book_createdAt_idx" ON "Book"("createdAt");

-- CreateIndex
CREATE INDEX "Book_deletedAt_idx" ON "Book"("deletedAt");

-- CreateIndex
CREATE INDEX "BorrowEvent_userId_idx" ON "BorrowEvent"("userId");

-- CreateIndex
CREATE INDEX "BorrowEvent_bookId_idx" ON "BorrowEvent"("bookId");
