-- CreateTable
CREATE TABLE "Voter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "Voter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbolUrl" TEXT NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterElectionStatus" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,

    CONSTRAINT "VoterElectionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CentralBallotBox" (
    "id" SERIAL NOT NULL,
    "voteMessage" TEXT NOT NULL,
    "voteSignature" TEXT NOT NULL,
    "previousEntryHash" TEXT,
    "currentEntryHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CentralBallotBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "receiptCode" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ElectionToParty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ElectionToParty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voter_email_key" ON "Voter"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Party_name_key" ON "Party"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VoterElectionStatus_voterId_electionId_key" ON "VoterElectionStatus"("voterId", "electionId");

-- CreateIndex
CREATE UNIQUE INDEX "CentralBallotBox_currentEntryHash_key" ON "CentralBallotBox"("currentEntryHash");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptCode_key" ON "Receipt"("receiptCode");

-- CreateIndex
CREATE INDEX "_ElectionToParty_B_index" ON "_ElectionToParty"("B");

-- AddForeignKey
ALTER TABLE "VoterElectionStatus" ADD CONSTRAINT "VoterElectionStatus_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterElectionStatus" ADD CONSTRAINT "VoterElectionStatus_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElectionToParty" ADD CONSTRAINT "_ElectionToParty_A_fkey" FOREIGN KEY ("A") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElectionToParty" ADD CONSTRAINT "_ElectionToParty_B_fkey" FOREIGN KEY ("B") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;
