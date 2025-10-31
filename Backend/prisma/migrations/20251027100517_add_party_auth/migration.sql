/*
  Migration to add party authentication fields
  - Adds email, passwordHash, isVerified, and createdAt fields to Party table
  - Handles existing parties by generating default credentials
*/

-- First, add nullable columns
ALTER TABLE "Party" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Party" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Party" ADD COLUMN "email" TEXT;
ALTER TABLE "Party" ADD COLUMN "passwordHash" TEXT;

-- Update existing parties with default values
-- Generate email based on party name and set default password
UPDATE "Party" SET
  "email" = LOWER(REPLACE(REPLACE(name, ' ', ''), '.', '')) || '@party.gov',
  "passwordHash" = '$2b$10$8K1p/mGa4ReAf4K.vmB7HO6En5ACJsY5SbUpMxdNVq8vTjHpvR6CO' -- bcrypt hash of 'Party@123'
WHERE "email" IS NULL;

-- Make columns NOT NULL after updating
ALTER TABLE "Party" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "Party" ALTER COLUMN "passwordHash" SET NOT NULL;

-- Create unique index
CREATE UNIQUE INDEX "Party_email_key" ON "Party"("email");
