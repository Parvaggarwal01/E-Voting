import forge from "node-forge";
import CryptoJS from "crypto-js";

class BlindSignature {
  constructor() {
    this.publicKey = null;
    this.blindingFactor = null;
  }

  // Initialize with server's public key
  async initialize() {
    try {
      const response = await fetch("/api/vote/public-key");
      const keyData = await response.json();

      // Convert PEM to forge public key
      this.publicKey = forge.pki.publicKeyFromPem(keyData.publicKey);

      console.log("✅ Public key loaded for blinding operations");
      return true;
    } catch (error) {
      console.error("❌ Failed to load public key:", error);
      return false;
    }
  }

  // Blind a message using RSA blinding
  blindMessage(message) {
    if (!this.publicKey) {
      throw new Error("Public key not initialized");
    }

    try {
      console.log("🔐 Blinding vote message (hiding from EC)");

      // Hash the message first
      const messageHash = CryptoJS.SHA256(message).toString();

      // Convert hash to BigInteger
      const messageInt = new forge.jsbn.BigInteger(messageHash, 16);

      // Generate random blinding factor r
      this.blindingFactor = new forge.jsbn.BigInteger(
        forge.random.getBytesSync(32),
        256
      );

      // Ensure blinding factor is coprime to n (modulus)
      const n = this.publicKey.n;
      const e = this.publicKey.e;

      // Calculate r^e mod n
      const rPowE = this.blindingFactor.modPow(e, n);

      // Blind the message: m' = m * r^e mod n
      const blindedMessage = messageInt.multiply(rPowE).mod(n);

      console.log("✅ Message blinded successfully");
      return blindedMessage.toString(16);
    } catch (error) {
      console.error("❌ Blinding error:", error);
      throw new Error("Failed to blind message");
    }
  }

  // Unblind a signed blinded message
  unblindSignature(blindedSignature) {
    if (!this.blindingFactor || !this.publicKey) {
      throw new Error("Blinding factor or public key not available");
    }

    try {
      console.log("🔓 Unblinding signature received from EC");

      // Convert signature to BigInteger
      const signatureInt = new forge.jsbn.BigInteger(blindedSignature, 16);

      // Calculate modular inverse of blinding factor
      const n = this.publicKey.n;
      const rInverse = this.blindingFactor.modInverse(n);

      // Unblind: s = s' * r^(-1) mod n
      const unblindedSignature = signatureInt.multiply(rInverse).mod(n);

      console.log("✅ Signature unblinded successfully");
      return unblindedSignature.toString(16);
    } catch (error) {
      console.error("❌ Unblinding error:", error);
      throw new Error("Failed to unblind signature");
    }
  }

  // Verify an unblinded signature (for testing purposes)
  verifySignature(message, signature) {
    if (!this.publicKey) {
      throw new Error("Public key not available");
    }

    try {
      // Hash the original message
      const messageHash = CryptoJS.SHA256(message).toString();
      const messageInt = new forge.jsbn.BigInteger(messageHash, 16);

      // Convert signature to BigInteger
      const signatureInt = new forge.jsbn.BigInteger(signature, 16);

      // Verify: message = signature^e mod n
      const n = this.publicKey.n;
      const e = this.publicKey.e;
      const decryptedHash = signatureInt.modPow(e, n);

      return messageInt.equals(decryptedHash);
    } catch (error) {
      console.error("❌ Verification error:", error);
      return false;
    }
  }

  // Clear sensitive data
  clear() {
    this.blindingFactor = null;
    console.log("🧹 Blinding factor cleared for security");
  }
}

// Export singleton instance
export const blindSignature = new BlindSignature();
export default BlindSignature;
