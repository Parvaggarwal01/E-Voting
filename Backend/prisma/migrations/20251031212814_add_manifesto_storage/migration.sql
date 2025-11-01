-- CreateTable
CREATE TABLE "manifestos" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extractedText" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "manifestos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "manifestos" ADD CONSTRAINT "manifestos_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;
