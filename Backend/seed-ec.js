const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedECCommissioners() {
  try {
    const ecCommissioners = [
      {
        email: "Commissioner1@ec.gov",
        name: "Commissioner One",
        password: "ec123456", // Default password, should be changed on first login
      },
      {
        email: "Commissioner2@ec.gov",
        name: "Commissioner Two",
        password: "ec123456", // Default password, should be changed on first login
      },
      {
        email: "Commissioner3@ec.gov",
        name: "Commissioner Three",
        password: "ec123456", // Default password, should be changed on first login
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

    console.log("EC Commissioners seeding completed!");
    console.log("\nLogin credentials:");
    console.log("Email: Commissioner1@ec.gov | Password: ec123456");
    console.log("Email: Commissioner2@ec.gov | Password: ec123456");
    console.log("Email: Commissioner3@ec.gov | Password: ec123456");
    console.log("\n⚠️  Please change the default passwords after first login!");
  } catch (error) {
    console.error("Error seeding EC Commissioners:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedECCommissioners();
