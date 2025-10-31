const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function setupECSystem() {
  try {
    console.log("Setting up EC Commissioner system...");

    // Check if ECCommissioner table exists and create it if not
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "ECCommissioner" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL UNIQUE,
          "passwordHash" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ECCommissioner_pkey" PRIMARY KEY ("id")
        );
      `;
      console.log("✓ ECCommissioner table created or already exists");
    } catch (error) {
      console.log(
        "ECCommissioner table already exists or error:",
        error.message
      );
    }

    // Create EC Commissioners
    const ecCommissioners = [
      {
        email: "Commissioner1@ec.gov",
        name: "Commissioner One",
        password: "ec123456",
      },
      {
        email: "Commissioner2@ec.gov",
        name: "Commissioner Two",
        password: "ec123456",
      },
      {
        email: "Commissioner3@ec.gov",
        name: "Commissioner Three",
        password: "ec123456",
      },
    ];

    console.log("Creating EC Commissioners...");

    for (const ec of ecCommissioners) {
      try {
        // Check if EC already exists
        const existing = await prisma.eCCommissioner.findUnique({
          where: { email: ec.email },
        });

        if (existing) {
          console.log(
            `EC Commissioner ${ec.email} already exists, skipping...`
          );
          continue;
        }

        const passwordHash = await bcrypt.hash(ec.password, 10);

        const commissioner = await prisma.eCCommissioner.create({
          data: {
            email: ec.email,
            name: ec.name,
            passwordHash,
          },
        });

        console.log(`✓ Created EC Commissioner: ${commissioner.email}`);
      } catch (error) {
        console.error(
          `Error creating EC Commissioner ${ec.email}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 EC Commissioner system setup completed!");
    console.log("\n📋 Login credentials for EC Commissioners:");
    console.log("┌─────────────────────────┬─────────────┐");
    console.log("│ Email                   │ Password    │");
    console.log("├─────────────────────────┼─────────────┤");
    console.log("│ Commissioner1@ec.gov    │ ec123456    │");
    console.log("│ Commissioner2@ec.gov    │ ec123456    │");
    console.log("│ Commissioner3@ec.gov    │ ec123456    │");
    console.log("└─────────────────────────┴─────────────┘");
    console.log("\n⚠️  Please change the default passwords after first login!");
    console.log("\n✅ System is now ready:");
    console.log("• Only voters can register through the registration form");
    console.log("• EC Commissioners use pre-created accounts above");
    console.log("• No more admin@admin.com hardcoded access");
  } catch (error) {
    console.error("Error setting up EC system:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupECSystem();
