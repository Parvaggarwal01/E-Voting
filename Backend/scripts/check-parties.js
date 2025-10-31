const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkParties() {
  try {
    console.log("🔍 Checking parties in database...");

    const parties = await prisma.party.findMany();

    console.log(`📊 Found ${parties.length} parties:`);

    parties.forEach((party, index) => {
      console.log(`\nParty ${index + 1}:`);
      console.log(`  ID: ${party.id}`);
      console.log(`  Name: ${party.name}`);
      console.log(`  Email: ${party.email}`);
      console.log(`  Verified: ${party.isVerified}`);
    });

    if (parties.length === 0) {
      console.log("\n⚠️ No parties found! Creating test parties...");

      const testParties = [
        {
          name: "BJP",
          email: "bjp@example.com",
          symbolUrl: "/symbols/bjp.png",
        },
        {
          name: "Congress",
          email: "congress@example.com",
          symbolUrl: "/symbols/congress.png",
        },
        {
          name: "AAP",
          email: "aap@example.com",
          symbolUrl: "/symbols/aap.png",
        },
      ];

      for (const partyData of testParties) {
        const party = await prisma.party.create({
          data: {
            ...partyData,
            passwordHash: "dummy-hash",
            isVerified: true,
          },
        });
        console.log(`✅ Created party: ${party.name} (ID: ${party.id})`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkParties();
