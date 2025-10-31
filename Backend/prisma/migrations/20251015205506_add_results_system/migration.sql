-- CreateTable
CREATE TABLE "ElectionResult" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "ElectionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectionStatus" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "resultsPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "ElectionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ElectionResult_electionId_partyId_key" ON "ElectionResult"("electionId", "partyId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionStatus_electionId_key" ON "ElectionStatus"("electionId");

-- AddForeignKey
ALTER TABLE "ElectionResult" ADD CONSTRAINT "ElectionResult_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionResult" ADD CONSTRAINT "ElectionResult_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionStatus" ADD CONSTRAINT "ElectionStatus_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
