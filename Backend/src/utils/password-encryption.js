const crypto = require("crypto");

// Use a fixed key for development - in production, this should be from environment variables
const ENCRYPTION_KEY =
  process.env.PASSWORD_ENCRYPTION_KEY || "my-secret-key-32-characters-long!!";
const ALGORITHM = "aes-256-cbc";

/**
 * Encrypts a plaintext password
 * @param {string} password - The plaintext password to encrypt
 * @returns {string} - The encrypted password with IV prepended
 */
function encryptPassword(password) {
  try {
    // Create a proper 32-byte key from the encryption key
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(password, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Return IV + encrypted data (separated by :)
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Error encrypting password:", error);
    throw new Error("Failed to encrypt password");
  }
}

/**
 * Decrypts an encrypted password
 * @param {string} encryptedPassword - The encrypted password (IV:encrypted)
 * @returns {string} - The decrypted plaintext password
 */
function decryptPassword(encryptedPassword) {
  try {
    if (!encryptedPassword || !encryptedPassword.includes(":")) {
      throw new Error("Invalid encrypted password format");
    }

    const parts = encryptedPassword.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];

    // Create the same key used for encryption
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Error decrypting password:", error);
    throw new Error("Failed to decrypt password");
  }
}

/**
 * Checks if a password string is encrypted (contains IV separator)
 * @param {string} password - The password to check
 * @returns {boolean} - True if encrypted, false if plaintext
 */
function isEncrypted(password) {
  return (
    password &&
    typeof password === "string" &&
    password.includes(":") &&
    password.split(":").length === 2
  );
}

module.exports = {
  encryptPassword,
  decryptPassword,
  isEncrypted,
};
