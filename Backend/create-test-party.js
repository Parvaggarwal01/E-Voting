const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function checkAndCreateParty() {
  try {
    console.log("🔍 Checking existing parties...");

    // Check all existing parties
    const parties = await prisma.party.findMany();
    console.log("📋 Current parties:", parties);

    // Check if BJP party exists
    let bjpParty = await prisma.party.findFirst({
      where: {
        OR: [
          { name: { contains: "BJP", mode: "insensitive" } },
          { name: { contains: "Bharatiya Janata Party", mode: "insensitive" } },
          { email: "bjp@party.gov" },
        ],
      },
    });

    if (bjpParty) {
      console.log("🏛️ BJP party found:", bjpParty);
    } else {
      console.log("❌ BJP party not found. Creating...");

      // Create BJP party with correct credentials
      const passwordHash = await bcrypt.hash("Party@123", 10);

      bjpParty = await prisma.party.create({
        data: {
          name: "Bharatiya Janata Party",
          email: "bjp@party.gov",
          passwordHash: passwordHash,
          symbolUrl: "https://example.com/bjp-symbol.png",
          isVerified: true,
        },
      });

      console.log("✅ BJP party created:", bjpParty);
    }

    // Test password verification
    console.log("\n🔐 Testing password verification...");
    const isValidPassword = await bcrypt.compare(
      "Party@123",
      bjpParty.passwordHash
    );
    console.log("Password 'Party@123' is valid:", isValidPassword);

    // Also create a test party for demonstration
    let testParty = await prisma.party.findFirst({
      where: { email: "testparty@party.gov" },
    });

    if (!testParty) {
      const testPasswordHash = await bcrypt.hash("Party@123", 10);
      testParty = await prisma.party.create({
        data: {
          name: "Test Party",
          email: "testparty@party.gov",
          passwordHash: testPasswordHash,
          symbolUrl: "https://example.com/test-symbol.png",
          isVerified: true,
        },
      });
      console.log("✅ Test party created:", testParty);
    }

    console.log("\n🎯 Use these credentials to login:");
    console.log("Email: bjp@party.gov");
    console.log("Password: Party@123");
    console.log("\nOr:");
    console.log("Email: testparty@party.gov");
    console.log("Password: Party@123");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateParty();
