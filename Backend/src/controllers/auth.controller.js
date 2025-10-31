const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt.helpers");

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    // Only allow voter registration, EC accounts are pre-created
    const user = await prisma.voter.create({
      data: {
        email: email,
        passwordHash,
      },
    });

    const token = generateToken({
      userId: user.id,
      voterId: user.id,
      email: email,
      role: "VOTER",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: email,
        role: "VOTER",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: "Email already exists." });
  }
};

exports.login = async (req, res) => {
  const { email, password, aadhaarNumber } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // First check if it's an EC Commissioner
    const ecCommissioner = await prisma.eCCommissioner.findUnique({
      where: { email: email },
    });

    if (ecCommissioner) {
      const isMatch = await bcrypt.compare(
        password,
        ecCommissioner.passwordHash
      );
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const token = generateToken({
        userId: ecCommissioner.id,
        email: email,
        role: "EC",
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: ecCommissioner.id,
          email: email,
          role: "EC",
          name: ecCommissioner.name,
        },
      });
    }

    // Check if it's a Party
    const party = await prisma.party.findUnique({
      where: { email: email },
    });

    if (party) {
      const isMatch = await bcrypt.compare(password, party.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const token = generateToken({
        userId: party.id,
        partyId: party.id,
        email: email,
        role: "PARTY",
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: party.id,
          email: email,
          role: "PARTY",
          name: party.name,
          partyId: party.id,
        },
      });
    }

    // For voter login, Aadhaar number is required
    if (!aadhaarNumber) {
      return res
        .status(400)
        .json({ error: "Aadhaar number is required for voter login." });
    }

    // Validate Aadhaar number format (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res
        .status(400)
        .json({ error: "Invalid Aadhaar number format. Must be 12 digits." });
    }

    // If not EC, check voter table with both email and Aadhaar number
    const voter = await prisma.voter.findFirst({
      where: {
        email: email,
        aadhaarNumber: aadhaarNumber,
      },
    });

    if (!voter) {
      return res.status(401).json({
        error:
          "Invalid credentials. Please check your email, password, and Aadhaar number.",
      });
    }

    const isMatch = await bcrypt.compare(password, voter.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error:
          "Invalid credentials. Please check your email, password, and Aadhaar number.",
      });
    }

    const token = generateToken({
      voterId: voter.id,
      userId: voter.id,
      email: email,
      role: "VOTER",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: voter.id,
        email: email,
        role: "VOTER",
        voterId: voter.voterId,
        name: voter.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Add verify endpoint for token validation
exports.verify = async (req, res) => {
  try {
    // The auth middleware should have already validated the token and set req.user
    const userId = req.user.userId || req.user.voterId || req.user.partyId;
    const userRole = req.user.role || "VOTER";

    // Base user info
    let userInfo = {
      id: userId,
      email: req.user.email,
      role: userRole,
    };

    if (userRole === "EC") {
      try {
        const ecCommissioner = await prisma.eCCommissioner.findUnique({
          where: { id: userId },
          select: { name: true },
        });
        if (ecCommissioner) {
          userInfo.name = ecCommissioner.name;
        }
      } catch (error) {
        console.error("Error fetching EC info:", error);
      }
    } else if (userRole === "PARTY") {
      try {
        const party = await prisma.party.findUnique({
          where: { id: userId },
          select: { name: true },
        });
        if (party) {
          userInfo.name = party.name;
          userInfo.partyId = userId;
        }
      } catch (error) {
        console.error("Error fetching Party info:", error);
      }
    }

    res.status(200).json(userInfo);
  } catch (error) {
    console.error("Verify error:", error);
    res.status(401).json({ error: "Invalid token." });
  }
};

// Change password endpoint for authenticated users
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: "Current password and new password are required.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: "New password must be at least 6 characters long.",
    });
  }

  try {
    const userId = req.user.userId || req.user.voterId;
    const userRole = req.user.role || "VOTER";
    const userEmail = req.user.email;

    let user;
    let updateData;

    if (userRole === "EC") {
      // Handle EC Commissioner password change
      user = await prisma.eCCommissioner.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "EC Commissioner not found." });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!isCurrentPasswordValid) {
        return res
          .status(401)
          .json({ error: "Current password is incorrect." });
      }

      // Hash new password and update
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      await prisma.eCCommissioner.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
    } else {
      // Handle Voter password change
      user = await prisma.voter.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "Voter not found." });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!isCurrentPasswordValid) {
        return res
          .status(401)
          .json({ error: "Current password is incorrect." });
      }

      // Hash new password and update
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      await prisma.voter.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
    }

    res.status(200).json({
      message: "Password changed successfully",
      user: {
        id: userId,
        email: userEmail,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};
