-- AlterTable
ALTER TABLE "Voter" ADD COLUMN     "encryptedPassword" TEXT,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "isVerified" DROP NOT NULL;
