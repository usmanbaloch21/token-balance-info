# Token Balance Checker

A production-ready application that allows users to connect their wallet and view the balance of ERC-20 tokens across multiple EVM chains.

## Features

- **Wallet Connection**: Connect MetaMask and other Ethereum-compatible wallets
- **Multi-Chain Support**: Check balances on Ethereum, Polygon, Arbitrum, Optimism, and Sepolia
- **Real-time Balance Checking**: Fetch token balances directly from the blockchain
- **Persistent Storage**: Automatically store balance queries in PostgreSQL database
- **Production-Ready**: Built with TypeScript, comprehensive error handling, and structured logging

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Wagmi** + **Web3Modal** for wallet connection
- **TanStack Query** for state management

### Backend
- **NestJS** with TypeScript
- **PostgreSQL** for data persistence
- **TypeORM** for database operations
- **Ethers.js** for blockchain interaction
- **Pino** for structured logging

## Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd token-balance-checker
npm run install:all
```

### 2. Environment Configuration

Copy the environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### 3. Start Database

```bash
npm run docker:up
```

### 4. Start the Application

```bash
npm run dev
or individually in different terminals 
npm run dev:backend
npm run dev:frontend
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432

## Manual Setup

### Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Database Setup

```bash
docker-compose up -d
```

## API Endpoints

### GET /api/chains
Returns a list of supported EVM chains with their configuration.

**Response:**
```json
[
  {
    "id": "1",
    "name": "Ethereum Mainnet",
    "rpcUrl": "https://ethereum-rpc.publicnode.com",
    "symbol": "ETH",
    "explorerUrl": "https://etherscan.io"
  }
]
```

### GET /api/balance
Fetches the ERC-20 token balance for a wallet address.

**Query Parameters:**
- `walletAddress`: Ethereum wallet address
- `tokenAddress`: ERC-20 token contract address  
- `chainId`: Chain ID (e.g., "1" for Ethereum)

**Response:**
```json
{
  "balance": "1000.123456",
  "symbol": "USDC",
  "decimals": 6
}
```

## Usage Example

1. **Connect Wallet**: Click "Connect Wallet" and select MetaMask
2. **Select Chain**: Choose from Ethereum, Polygon, Arbitrum, etc.
3. **Enter Token Address**: Input an ERC-20 token contract address
4. **Check Balance**: Click "Check Balance" to fetch the result

### Example Token Addresses

**Ethereum Mainnet:**
- USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- USDT: `0xdAC17F958D2ee523a2206206994597C13D831ec7`

**Polygon Mainnet:**
- USDC: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- USDT: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

## Technical Decisions

### Frontend Architecture
- **Next.js App Router**: Modern React framework with server-side rendering
- **Wagmi + Web3Modal**: Industry standard for wallet connections
- **Component-Based Design**: Reusable, maintainable React components
- **TypeScript**: Type safety throughout the application

### Backend Architecture
- **NestJS**: Enterprise-grade Node.js framework with dependency injection
- **Modular Structure**: Separate modules for chains and balance functionality
- **Async Database Operations**: Non-blocking balance storage
- **Public RPC Endpoints**: No API key dependencies for easier setup

### Database Design
- **PostgreSQL**: Reliable, production-ready database
- **TypeORM**: Type-safe database operations
- **Automatic Migrations**: Schema synchronization in development

## Security Features

- **Input Validation**: Ethereum address validation and sanitization
- **Error Handling**: Comprehensive error boundaries and logging
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure configuration management

## Assumptions Made

1. **Public RPC Endpoints**: Used reliable public endpoints to avoid API key requirements
2. **Chain Selection**: Curated list of major EVM chains for better UX
3. **Token Standards**: Assumes ERC-20 compliant tokens
4. **Wallet Support**: Focused on MetaMask and WalletConnect compatible wallets

## Future Improvements

Given more time, I would implement:

1. **Enhanced Features**:
   - Token price information integration
   - Transaction history tracking
   - Multi-wallet support
   - Balance change notifications

2. **Performance Optimizations**:
   - Redis caching for frequent queries
   - Rate limiting for API endpoints
   - Connection pooling for database
   - WebSocket real-time updates

3. **Production Readiness**:
   - Docker production images
   - Kubernetes deployment manifests
   - Monitoring and alerting (Prometheus/Grafana)
   - Comprehensive unit and integration tests

4. **User Experience**:
   - Dark mode support
   - Mobile-first responsive design
   - Offline capabilities
   - Advanced filtering and search

## Testing

The application includes comprehensive test coverage for backend controllers and services.

### Backend Tests
```bash
# Run all unit tests
npm run test:backend

# Run with coverage report
cd backend && npm run test:cov

# Run e2e tests
npm run test:e2e

# Watch mode for development
cd backend && npm run test:watch
```

### Test Coverage
✅ **Controllers**: Complete test coverage for all API endpoints
- `ChainsController`: Tests for /api/chains endpoint
- `BalanceController`: Tests for /api/balance endpoint with validation

✅ **Services**: Comprehensive service layer testing
- `ChainsService`: Chain configuration and RPC URL management
- `BalanceService`: Blockchain interaction, token balance fetching, database operations

✅ **Error Handling**: Tests for all error scenarios
- Invalid addresses, unsupported chains, network failures
- Database errors, contract interaction failures

✅ **Integration Tests**: E2E API testing with validation
- Request/response validation, CORS, error formatting

### Test Results
```
Test Suites: 4 passed, 4 total
Tests:       40 passed, 40 total
```

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
