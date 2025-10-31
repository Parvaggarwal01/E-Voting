const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const testVoters = [
  {
    voterId: "VOTER001",
    email: "voter1@test.com",
    name: "Alice Johnson",
    phone: "9876543210",
    address: "123 Main St, Delhi",
    aadhaarNumber: "123456789012",
  },
  {
    voterId: "VOTER002",
    email: "voter2@test.com",
    name: "Bob Smith",
    phone: "9876543211",
    address: "456 Oak Ave, Mumbai",
    aadhaarNumber: "123456789013",
  },
  {
    voterId: "VOTER003",
    email: "voter3@test.com",
    name: "Charlie Brown",
    phone: "9876543212",
    address: "789 Pine Rd, Bangalore",
    aadhaarNumber: "123456789014",
  },
  {
    voterId: "VOTER004",
    email: "voter4@test.com",
    name: "Diana Prince",
    phone: "9876543213",
    address: "321 Cedar St, Chennai",
    aadhaarNumber: "123456789015",
  },
  {
    voterId: "VOTER005",
    email: "voter5@test.com",
    name: "Edward Norton",
    phone: "9876543214",
    address: "654 Elm Dr, Kolkata",
    aadhaarNumber: "123456789016",
  },
];

async function createTestVoters() {
  try {
    console.log("🗳️ Creating test voters...");

    const defaultPassword = "voter123";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    for (const voterData of testVoters) {
      try {
        const voter = await prisma.voter.create({
          data: {
            ...voterData,
            passwordHash,
            encryptedPassword: defaultPassword, // For demo purposes
            isVerified: true,
            dateOfBirth: new Date("1990-01-01"),
            createdAt: new Date(),
          },
        });

        console.log(`✅ Created voter: ${voter.name} (${voter.email})`);
      } catch (error) {
        if (error.code === "P2002") {
          console.log(
            `⚠️ Voter ${voterData.email} already exists, skipping...`
          );
        } else {
          throw error;
        }
      }
    }

    const voterCount = await prisma.voter.count();
    console.log(`\n📊 Total voters in database: ${voterCount}`);

    console.log(`\n🔐 Test voter credentials:`);
    testVoters.forEach((voter) => {
      console.log(`Email: ${voter.email} | Password: ${defaultPassword}`);
    });
  } catch (error) {
    console.error("❌ Error creating test voters:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestVoters();
