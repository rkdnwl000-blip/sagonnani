-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "commission_transactions"
  ADD COLUMN "orderId"    TEXT UNIQUE,
  ADD COLUMN "paymentKey" TEXT,
  ADD COLUMN "status"     "TxStatus" NOT NULL DEFAULT 'SUCCESS';
