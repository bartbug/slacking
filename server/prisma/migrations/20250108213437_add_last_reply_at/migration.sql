-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "lastReplyAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Message_parentId_idx" ON "Message"("parentId");
