# E-Voting System with Blockchain Integration

A secure, privacy-preserving electronic voting system built with React, Node.js, PostgreSQL, and Ethereum blockchain (Sepolia testnet) integration.

## 🏗️ System Architecture

```
Frontend (React/Vite) ↔ Backend (Node.js/Express) ↔ PostgreSQL Database
                                    ↕                       ↕
                            Ethereum Sepolia Testnet    AI Service (Python/Flask)
                               (via Alchemy RPC)           ↕
                                                      Ollama AI (llama3.2:3b)
```

## 🔑 Key Features

- **🔐 Privacy-Preserving**: Anonymous vote storage in CentralBallotBox
- **⛓️ Blockchain Security**: Immutable vote records on Ethereum Sepolia
- **🗳️ Multi-Role System**: Voters, Election Commission, Admin roles
- **📱 Responsive UI**: Modern React interface with Tailwind CSS
- **🔒 Secure Authentication**: JWT-based auth with role-based access
- **📊 Real-time Results**: Live vote counting and statistics
- **🧾 Vote Receipts**: Cryptographic proof of vote submission
- **🤖 AI-Powered Manifesto Analysis**: Intelligent Q&A on political manifestos
- **📄 Document Processing**: Automatic PDF manifesto parsing and analysis

## 📁 Project Structure

```
E-Voting/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── context/         # React context (Auth, Blockchain)
│   │   ├── services/        # API services
│   │   └── config/          # Configuration files
├── Backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models (Prisma)
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication middleware
│   │   └── config/          # Database config
├── blockchain/              # Blockchain contracts & scripts
│   ├── contracts/           # Solidity smart contracts
│   ├── scripts/             # Deployment scripts
│   └── hardhat.config.js    # Hardhat configuration
├── Backend/ai_service/      # AI microservice for manifesto analysis
│   ├── manifesto_app.py     # Advanced Ollama-based AI service
│   ├── simple_app.py        # Simple AI service (fallback)
│   ├── manifesto_requirements.txt
│   └── simple_requirements.txt
└── README.md
```

## 🚀 Quick Start

### First Time Setup (Complete Process)

```bash
# 1. Clone and setup
git clone <repository-url>
cd E-Voting

# 2. Backend setup
cd Backend
npm install
cp .env.example .env  # Configure your .env
npx prisma generate && npx prisma db push
npm run setup-ec && node seed-ec.js
node scripts/register-ec-wallet.js
npm start  # Runs on http://localhost:8000

# 3. Frontend setup (in new terminal)
cd ../Frontend
npm install
npm run dev  # Runs on http://localhost:5173

# 4. AI Service setup (optional - for manifesto analysis)
cd ../Backend/ai_service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r manifesto_requirements.txt
python manifesto_app.py  # Runs on http://localhost:5001

# 5. Login as EC Commissioner
# Email: Commissioner1@ec.gov
# Password: ec123456
```

## 🛠️ Detailed Setup Instructions

### Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (v13+)
- **MetaMask** browser extension
- **Git**

### 1. Clone Repository

```bash
git clone <repository-url>
cd E-Voting
```

### 2. Database Setup

```bash
# Start PostgreSQL service
brew services start postgresql  # macOS
# or
sudo service postgresql start   # Linux

# Create database
createdb e_voting

# Or using psql
psql -U postgres
CREATE DATABASE e_voting;
\q
```

### 3. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

**Configure Backend/.env:**

```env
PORT=8000
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/e_voting"
JWT_SECRET="E_VOTING_SECRET_KEY"

# Blockchain Configuration (Sepolia)
ALCHEMY_API_KEY="your_alchemy_api_key_here"
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/your_alchemy_api_key_here"
DEPLOYER_PRIVATE_KEY="0xYOUR_METAMASK_PRIVATE_KEY_HERE"
EC_PRIVATE_KEY="0xYOUR_EC_COMMISSIONER_PRIVATE_KEY_HERE"
VOTING_SYSTEM_ADDRESS="0xb7b9413fd92C1cC551Af838c60F5290Bc6ff0020"
NETWORK="sepolia"
```

```bash
# Generate Prisma client and run migrations
npx prisma generate
npx prisma db push

# Setup EC Commissioner system (first time setup)
npm run setup-ec

# Add default EC Commissioners
node seed-ec.js

# Register EC wallet on blockchain (required for vote casting)
node scripts/register-ec-wallet.js

# Start backend server
npm start
```

### 4. Blockchain Setup

```bash
cd blockchain

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

**Configure blockchain/.env:**

```env
ALCHEMY_API_KEY="your_alchemy_api_key_here"
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/your_alchemy_api_key_here"
DEPLOYER_PRIVATE_KEY="0xYOUR_METAMASK_PRIVATE_KEY_HERE"
EC_PRIVATE_KEY="0xYOUR_EC_COMMISSIONER_PRIVATE_KEY_HERE"
```

**The smart contract is already deployed to Sepolia at:**
`0xb7b9413fd92C1cC551Af838c60F5290Bc6ff0020`

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 6. AI Service Setup (Optional)

The AI service provides intelligent manifesto analysis and Q&A capabilities.

**Prerequisites:**

- **Python 3.8+**
- **Ollama** (for advanced AI features)

```bash
cd Backend/ai_service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Option 1: Advanced AI with Ollama (Recommended)
pip install -r manifesto_requirements.txt

# Install Ollama (if not installed)
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.ai/install.sh | sh
# Windows: Download from https://ollama.ai/download

# Pull required model
ollama pull llama3.2:3b

# Start advanced AI service
python manifesto_app.py  # Runs on http://localhost:5001

# Option 2: Simple AI (Fallback without Ollama)
pip install -r simple_requirements.txt
python simple_app.py  # Runs on http://localhost:5001
```

## 🔑 Getting Blockchain Credentials

### 1. Alchemy API Key

1. Go to [Alchemy](https://www.alchemy.com/)
2. Sign up and create a new app for **Ethereum Sepolia**
3. Copy your API key

### 2. MetaMask Private Key

1. Open MetaMask → Account menu → Account Details
2. Click "Show Private Key" → Enter password
3. Copy the private key (include 0x prefix)

### 3. Sepolia Test ETH

- Get free Sepolia ETH from: https://sepoliafaucet.com/
- You need ~0.02 ETH for deployment and transactions

## 🎯 System Usage

### Default EC Commissioner Credentials

After running `node seed-ec.js`, you can login with:

| Email                  | Password   | Name               |
| ---------------------- | ---------- | ------------------ |
| `Commissioner1@ec.gov` | `ec123456` | Commissioner One   |
| `Commissioner2@ec.gov` | `ec123456` | Commissioner Two   |
| `Commissioner3@ec.gov` | `ec123456` | Commissioner Three |

⚠️ **Important**: Change default passwords using `npm run manage-passwords`

### Election Commission (EC)

1. **Login**: Use EC credentials to access admin panel
2. **Manage Elections**: Create and configure elections
3. **Register Voters**: Bulk import or individual registration
4. **Monitor Blockchain**: Check wallet connection and stats
5. **View Results**: Real-time vote counting and analytics

### Political Parties

1. **Registration**: Register party through EC
2. **Manifesto Upload**: Upload PDF manifestos for analysis
3. **AI Analysis**: Get AI-powered insights on manifesto content
4. **Campaign Management**: Manage party information and promises

### Voters

1. **Registration**: Get voter ID from EC
2. **Verification**: Verify identity using voter ID
3. **Manifesto Analysis**: Ask questions about party manifestos using AI
4. **Vote Casting**: Select candidate and submit encrypted vote
5. **Receipt**: Receive cryptographic proof of vote
6. **Results**: View published election results

### System Flow

````
Party Registration → Manifesto Upload → AI Analysis →
Voter Registration → Identity Verification → Manifesto Q&A →
Vote Casting → Blockchain Storage → Anonymous DB Storage → Results Calculation
```## 🔒 Privacy & Security Features

### Privacy Protection
- **Anonymous Vote Storage**: No voter-candidate association stored
- **Cryptographic Hashing**: Vote data encrypted with keccak256
- **Blind Signatures**: Additional privacy layer
- **Separate Storage**: Voter identity and vote data never linked

### Blockchain Security
- **Immutable Records**: Votes permanently stored on Sepolia
- **Smart Contract Validation**: Automated vote verification
- **Transaction Receipts**: Cryptographic proof of each vote
- **Decentralized Storage**: No single point of failure

## 🛠️ Development Commands

### Backend
```bash
# Start development server
npm run dev

# Run database migrations
npx prisma db push

# Reset database
npx prisma db reset

# View database
npx prisma studio
````

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Blockchain

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia (if needed - already deployed)
npm run deploy:sepolia

# Verify network connection
npm run check-network -- --network sepolia

# View blockchain data
node scripts/blockchain-viewer.js
```

### AI Service

```bash
# Start advanced AI service (with Ollama)
cd Backend/ai_service
source venv/bin/activate
python manifesto_app.py

# Start simple AI service (fallback)
python simple_app.py

# Test AI service health
curl http://localhost:5001/health

# Install new AI models (Ollama)
ollama pull llama3.2:3b
ollama pull llama3.2:1b  # Lighter model
```

### Backend Setup Commands

```bash
# Setup EC Commissioner system (first time only)
npm run setup-ec

# Add EC Commissioners to database
node seed-ec.js

# Register EC wallet as blockchain voter
node scripts/register-ec-wallet.js

# Manage EC Commissioner passwords
npm run manage-passwords

# Sync voters to blockchain
node scripts/sync-voters-to-blockchain.js
```

## 🔧 Troubleshooting

### Common Issues

**1. "Voter not registered" blockchain error**

```bash
# Register EC wallet as voter
cd Backend
node scripts/register-ec-wallet.js
```

**2. "Invalid or expired token" API error**

- Log out and log back in as EC Commissioner
- Check if backend server is running

**3. "Please switch to Sepolia Testnet" error**

- Open MetaMask and switch to Sepolia Testnet
- Make sure you have Sepolia ETH in your wallet

**4. Database connection error**

- Check if PostgreSQL is running
- Verify DATABASE_URL in .env file
- Run `npx prisma db push` to sync schema

**5. "No votes showing in results"**

- Check if votes are in CentralBallotBox: `SELECT * FROM "CentralBallotBox";`
- Click "Recalculate Results" in EC panel

**6. "AI service not responding" error**

```bash
# Check if AI service is running
curl http://localhost:5001/health

# Restart AI service
cd Backend/ai_service
source venv/bin/activate
python manifesto_app.py

# Check Ollama is running (for advanced features)
ollama list
ollama pull llama3.2:3b
```

**7. "Manifesto analysis failed" error**

- Ensure AI service is running on port 5001
- Check if PDF is valid and readable
- Verify Ollama model is downloaded: `ollama list`

### Network Issues

```bash
# Check if services are running
curl http://localhost:8000/api/health  # Backend
curl http://localhost:5173             # Frontend
curl http://localhost:5001/health      # AI Service

# Check blockchain connection
cd blockchain
npm run check-network -- --network sepolia
```

## 📊 Database Schema

### Key Tables

- **Voters**: Voter registration and verification
- **Elections**: Election configurations and status
- **Parties**: Political parties/candidates
- **CentralBallotBox**: Anonymous vote storage (privacy-preserving)
- **VoterElectionStatus**: Tracks who voted (without vote details)

## 🌍 Deployment

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
JWT_SECRET="strong-random-secret-key"
ALCHEMY_API_KEY="production-alchemy-key"
```

### Build Commands

```bash
# Backend
npm run build

# Frontend
npm run build
```

## 📈 System Statistics

- **Smart Contract**: Deployed on Sepolia Testnet
- **Gas Efficiency**: ~150,000 gas per vote transaction
- **Privacy**: Zero voter-candidate linkage in database
- **Security**: Cryptographic hash validation
- **Scalability**: Supports unlimited voters and elections
- **AI Processing**: PDF manifesto analysis with Ollama LLM
- **Response Time**: ~2-5 seconds for AI-powered Q&A
- **Supported Formats**: PDF manifesto documents up to 50MB

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check troubleshooting section above
2. Review error logs in browser console
3. Verify all environment variables are set
4. Ensure all services (PostgreSQL, Backend, Frontend) are running

## 🔗 Useful Links

- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Contract Address**: https://sepolia.etherscan.io/address/0xb7b9413fd92C1cC551Af838c60F5290Bc6ff0020
- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Sepolia Faucet**: https://sepoliafaucet.com/
