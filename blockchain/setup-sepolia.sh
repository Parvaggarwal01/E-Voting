#!/bin/bash

echo "🚀 E-Voting Sepolia Setup Guide"
echo "================================="
echo ""

echo "📋 Required Information:"
echo "1. Your Alchemy API Key"
echo "2. Your MetaMask Private Key (for the account with 0.05 Sepolia ETH)"
echo "3. Your EC Commissioner Private Key"
echo ""

echo "🔍 Getting your Alchemy API Key:"
echo "1. Go to https://www.alchemy.com/"
echo "2. Sign up/Login to your account"
echo "3. Create a new app for Ethereum Sepolia"
echo "4. Copy the API Key from the dashboard"
echo ""

echo "🔐 Getting your MetaMask Private Key:"
echo "1. Open MetaMask extension"
echo "2. Click on account menu (3 dots)"
echo "3. Go to Account Details"
echo "4. Click 'Show Private Key'"
echo "5. Enter your MetaMask password"
echo "6. Copy the private key (starts with 0x)"
echo ""

echo "⚠️  SECURITY WARNING:"
echo "- Never share your private keys"
echo "- Don't commit private keys to git"
echo "- Use environment variables for sensitive data"
echo "- Consider using a test wallet for development"
echo ""

read -p "Do you have your Alchemy API Key? (y/n): " has_alchemy
read -p "Do you have your MetaMask Private Key? (y/n): " has_private_key

if [[ "$has_alchemy" == "y" && "$has_private_key" == "y" ]]; then
    echo ""
    echo "📝 Please enter your configuration:"
    echo ""

    read -p "Enter your Alchemy API Key: " alchemy_key
    read -p "Enter your MetaMask Private Key (with 0x prefix): " private_key
    read -p "Enter your EC Commissioner Private Key (optional, press enter to use same): " ec_private_key

    if [[ -z "$ec_private_key" ]]; then
        ec_private_key="$private_key"
    fi

    # Create the RPC URL
    sepolia_rpc="https://eth-sepolia.g.alchemy.com/v2/$alchemy_key"

    echo ""
    echo "🔧 Updating your .env file..."

    # Update the .env file
    env_file="../Backend/.env"

    # Create backup
    cp "$env_file" "${env_file}.backup"

    # Update environment variables
    sed -i '' "s|ALCHEMY_API_KEY=\".*\"|ALCHEMY_API_KEY=\"$alchemy_key\"|g" "$env_file"
    sed -i '' "s|SEPOLIA_RPC_URL=\".*\"|SEPOLIA_RPC_URL=\"$sepolia_rpc\"|g" "$env_file"
    sed -i '' "s|DEPLOYER_PRIVATE_KEY=\".*\"|DEPLOYER_PRIVATE_KEY=\"$private_key\"|g" "$env_file"
    sed -i '' "s|EC_PRIVATE_KEY=\".*\"|EC_PRIVATE_KEY=\"$ec_private_key\"|g" "$env_file"

    echo "✅ Environment variables updated!"
    echo ""
    echo "🚀 Ready to deploy! Run:"
    echo "   npm run deploy:sepolia"
    echo ""
    echo "📊 Or test your configuration first:"
    echo "   npx hardhat run scripts/deploy-sepolia.js --network sepolia"

else
    echo ""
    echo "❌ Please get your API key and private key first, then run this script again."
    echo ""
    echo "🔗 Helpful links:"
    echo "- Alchemy: https://www.alchemy.com/"
    echo "- Sepolia Faucet: https://sepoliafaucet.com/"
    echo "- MetaMask: https://metamask.io/"
fi

echo ""
echo "📚 Next steps after deployment:"
echo "1. Test voter registration"
echo "2. Test vote casting"
echo "3. Check contract on Etherscan"
echo "4. Update frontend configuration"