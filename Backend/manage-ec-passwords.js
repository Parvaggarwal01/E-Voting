const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function askPassword(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.resume();
    stdin.setEncoding("utf8");
    stdin.setRawMode(true);

    process.stdout.write(question);

    let password = "";

    stdin.on("data", function (char) {
      char = char + "";

      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.setRawMode(false);
          stdin.pause();
          console.log();
          resolve(password);
          break;
        case "\u0003":
          process.exit();
          break;
        case "\u007f": // backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write("\b \b");
          }
          break;
        default:
          password += char;
          process.stdout.write("*");
          break;
      }
    });
  });
}

async function changeECPassword() {
  try {
    console.log("\n🔑 EC Commissioner Password Change Utility");
    console.log("==========================================\n");

    // List all EC Commissioners
    const commissioners = await prisma.eCCommissioner.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (commissioners.length === 0) {
      console.log("❌ No EC Commissioners found in the database.");
      console.log("💡 Run 'npm run setup-ec' to create EC accounts first.");
      process.exit(1);
    }

    console.log("📋 Available EC Commissioners:");
    console.log(
      "┌─────┬─────────────────────────┬─────────────────────┬─────────────────────┐"
    );
    console.log(
      "│ No. │ Email                   │ Name                │ Created At          │"
    );
    console.log(
      "├─────┼─────────────────────────┼─────────────────────┼─────────────────────┤"
    );

    commissioners.forEach((comm, index) => {
      const email = comm.email.padEnd(23);
      const name = comm.name.padEnd(19);
      const created = comm.createdAt.toLocaleDateString().padEnd(19);
      console.log(
        `│ ${(index + 1)
          .toString()
          .padStart(3)} │ ${email} │ ${name} │ ${created} │`
      );
    });

    console.log(
      "└─────┴─────────────────────────┴─────────────────────┴─────────────────────┘\n"
    );

    // Get user selection
    const selection = await askQuestion(
      "Enter the number of EC Commissioner to change password for: "
    );
    const commissionerIndex = parseInt(selection) - 1;

    if (commissionerIndex < 0 || commissionerIndex >= commissioners.length) {
      console.log("❌ Invalid selection. Please run the script again.");
      process.exit(1);
    }

    const selectedCommissioner = commissioners[commissionerIndex];
    console.log(
      `\n🎯 Selected: ${selectedCommissioner.name} (${selectedCommissioner.email})`
    );

    // Get new password
    const newPassword = await askPassword(
      "Enter new password (6+ characters): "
    );

    if (newPassword.length < 6) {
      console.log("\n❌ Password must be at least 6 characters long.");
      process.exit(1);
    }

    const confirmPassword = await askPassword("Confirm new password: ");

    if (newPassword !== confirmPassword) {
      console.log("\n❌ Passwords do not match.");
      process.exit(1);
    }

    // Confirm the change
    console.log(
      `\n⚠️  Are you sure you want to change the password for ${selectedCommissioner.email}?`
    );
    const confirmation = await askQuestion("Type 'YES' to confirm: ");

    if (confirmation !== "YES") {
      console.log("❌ Operation cancelled.");
      process.exit(0);
    }

    // Hash the new password and update
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.eCCommissioner.update({
      where: { id: selectedCommissioner.id },
      data: { passwordHash },
    });

    console.log("\n✅ Password changed successfully!");
    console.log(`📧 Commissioner: ${selectedCommissioner.email}`);
    console.log(`👤 Name: ${selectedCommissioner.name}`);
    console.log(`🕐 Changed at: ${new Date().toLocaleString()}`);
    console.log(
      "\n💡 The EC Commissioner can now login with their new password."
    );
  } catch (error) {
    console.error("\n❌ Error changing password:", error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

async function resetToDefault() {
  try {
    console.log("\n🔄 Reset All EC Passwords to Default");
    console.log("====================================\n");

    const confirmation = await askQuestion(
      "⚠️  This will reset ALL EC passwords to 'ec123456'. Type 'RESET' to confirm: "
    );

    if (confirmation !== "RESET") {
      console.log("❌ Operation cancelled.");
      process.exit(0);
    }

    const defaultPasswordHash = await bcrypt.hash("ec123456", 10);

    const result = await prisma.eCCommissioner.updateMany({
      data: { passwordHash: defaultPasswordHash },
    });

    console.log(
      `\n✅ Reset ${result.count} EC Commissioner passwords to default.`
    );
    console.log("🔑 Default password: ec123456");
    console.log(
      "⚠️  Please ask commissioners to change their passwords after login!"
    );
  } catch (error) {
    console.error("\n❌ Error resetting passwords:", error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

async function main() {
  console.log("\n🏛️ EC Password Management");
  console.log("=========================");
  console.log("1. Change individual EC password");
  console.log("2. Reset all EC passwords to default");
  console.log("3. Exit");

  const choice = await askQuestion("\nSelect an option (1-3): ");

  switch (choice) {
    case "1":
      await changeECPassword();
      break;
    case "2":
      await resetToDefault();
      break;
    case "3":
      console.log("👋 Goodbye!");
      process.exit(0);
      break;
    default:
      console.log("❌ Invalid choice. Please run the script again.");
      process.exit(1);
  }
}

main().catch(console.error);
