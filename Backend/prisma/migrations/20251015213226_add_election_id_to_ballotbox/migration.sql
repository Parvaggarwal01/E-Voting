/*
  Warnings:

  - Added the required column `electionId` to the `CentralBallotBox` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CentralBallotBox" ADD COLUMN     "electionId" TEXT NOT NULL;
