/*
  Warnings:

  - A unique constraint covering the columns `[aadhaarNumber]` on the table `Voter` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Voter" ADD COLUMN     "aadhaarNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Voter_aadhaarNumber_key" ON "Voter"("aadhaarNumber");
