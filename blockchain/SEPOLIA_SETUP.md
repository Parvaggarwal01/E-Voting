# Sepolia Testnet Setup Guide

## 🚀 Quick Setup Steps

### 1. Get Your Credentials

#### Alchemy API Key:

1. Go to [Alchemy](https://www.alchemy.com/)
2. Sign up/Login
3. Create new app → Ethereum → Sepolia
4. Copy the API Key from dashboard

#### MetaMask Private Key:

1. Open MetaMask extension
2. Click account menu (3 dots) → Account Details
3. Click "Show Private Key"
4. Enter MetaMask password
5. Copy private key (starts with 0x)

### 2. Configure Environment

Update your `.env` file in the `Backend` folder:

```bash
# Replace these values with your actual credentials
ALCHEMY_API_KEY="your_alchemy_api_key_here"
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/your_alchemy_api_key_here"
DEPLOYER_PRIVATE_KEY="0xYOUR_METAMASK_PRIVATE_KEY_HERE"
EC_PRIVATE_KEY="0xYOUR_EC_COMMISSIONER_PRIVATE_KEY_HERE"
VOTING_SYSTEM_ADDRESS=""  # Will be filled after deployment
NETWORK="sepolia"
```

### 3. Verify Configuration

```bash
cd blockchain
npm run check-network -- --network sepolia
```

### 4. Deploy Contract

```bash
npm run deploy:sepolia
```

## 📋 Manual Setup (Alternative)

If you prefer to set up manually:

### Step 1: Install Dependencies

```bash
cd blockchain
npm install dotenv
```

### Step 2: Update Hardhat Config

The hardhat.config.js has been updated to support Sepolia network.

### Step 3: Test Network Connection

```bash
npx hardhat run scripts/check-network.js --network sepolia
```

### Step 4: Deploy Contract

```bash
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

## 🔍 Verification

After deployment, you can:

1. **Check Contract on Etherscan:**

   - Go to https://sepolia.etherscan.io/
   - Search for your contract address

2. **Verify Contract Source:**

   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

3. **Test Frontend Connection:**
   - Make sure MetaMask is connected to Sepolia
   - The frontend will automatically use the new contract

## ⚠️ Important Security Notes

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive data
3. **Consider using a test wallet** for development
4. **Backup your .env file** securely

## 🛠 Troubleshooting

### Common Issues:

1. **"Insufficient funds" error:**

   - Make sure you have at least 0.01 ETH in Sepolia
   - Get free Sepolia ETH from: https://sepoliafaucet.com/

2. **"Network not found" error:**

   - Check your Alchemy API key
   - Verify the RPC URL format

3. **"Invalid private key" error:**

   - Ensure private key starts with "0x"
   - Don't include spaces or extra characters

4. **MetaMask connection issues:**
   - Add Sepolia network to MetaMask manually:
     - Network Name: Sepolia Testnet
     - RPC URL: https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
     - Chain ID: 11155111
     - Currency Symbol: ETH
     - Block Explorer: https://sepolia.etherscan.io/

## 🎯 Next Steps After Deployment

1. **Test Voter Registration:** Try registering a test voter
2. **Test Vote Casting:** Cast a test vote
3. **Monitor on Etherscan:** Watch transactions in real-time
4. **Update Frontend:** Ensure UI connects to Sepolia contract

## 📞 Getting Help

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify your .env configuration
3. Test network connectivity with the check-network script
4. Ensure you have sufficient Sepolia ETH balance

## 🔗 Useful Links

- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Dashboard](https://dashboard.alchemy.com/)
- [MetaMask](https://metamask.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
