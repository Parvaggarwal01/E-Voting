/*
  Warnings:

  - A unique constraint covering the columns `[voterId]` on the table `Voter` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Voter" ADD COLUMN     "address" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "realEmail" TEXT,
ADD COLUMN     "voterId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Voter_voterId_key" ON "Voter"("voterId");
