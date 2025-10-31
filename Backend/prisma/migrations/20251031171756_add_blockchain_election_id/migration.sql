/*
  Warnings:

  - A unique constraint covering the columns `[blockchainElectionId]` on the table `Election` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "blockchainElectionId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Election_blockchainElectionId_key" ON "Election"("blockchainElectionId");
