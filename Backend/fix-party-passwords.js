const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function fixPartyPasswords() {
  try {
    console.log("🔧 Fixing party passwords...");

    // Generate correct password hash for "Party@123"
    const correctPasswordHash = await bcrypt.hash("Party@123", 10);

    // Update all existing parties with correct password
    const updatedParties = await prisma.party.updateMany({
      data: {
        passwordHash: correctPasswordHash,
        isVerified: true,
      },
    });

    console.log(
      `✅ Updated ${updatedParties.count} parties with correct password`
    );

    // Verify the update worked
    const bjpParty = await prisma.party.findFirst({
      where: { email: "bjp@party.gov" },
    });

    if (bjpParty) {
      const isValid = await bcrypt.compare("Party@123", bjpParty.passwordHash);
      console.log("🔐 BJP password verification:", isValid);
    }

    console.log("\n🎯 All parties now use these credentials:");
    console.log("📧 Email: bjp@party.gov");
    console.log("🔑 Password: Party@123");
    console.log("\n📧 Email: congress@party.gov");
    console.log("🔑 Password: Party@123");
    console.log("\n📧 Email: aap@party.gov");
    console.log("🔑 Password: Party@123");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPartyPasswords();
