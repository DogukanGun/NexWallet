# Current Architecture
## Overview
NexWallet is a cutting-edge platform that combines blockchain technology with artificial intelligence to provide a seamless and intelligent wallet management experience. It supports multiple blockchain networks and offers unique features such as AI-driven transaction signing.
## Key Features
- **Multi-Chain Support**: Solana, Base, Ethereum, Arbitrum, and more.
- **AI-Driven Interactions**: Text and voice command capabilities.
- **Unique Transaction Signing**: First platform to offer AI agent transaction signing.
- **Real-Time Data Integration**: Utilizes Cookie DataSwarm API for up-to-date blockchain data.
- **Robust Security**: Advanced authentication and security measures.
## Technical Documentation
### Architecture Overview
- **Backend**:
  - **API Service**: Handles all blockchain interactions and API requests.
  - **Database**: Utilizes PostgreSQL for storing user data, agent configurations, and transaction history.
  - **Authentication**: Implements OAuth 2.0 for secure user authentication.
- **Frontend**:
  - **React Components**: Reusable UI components for a seamless user experience.

## Main changes done in SEND AI
 
 - SolanaAgentKit now includes a callback mechanism.
     <img width="629" alt="Screenshot 2025-01-23 at 15 21 08" src="https://github.com/user-attachments/assets/ed8d88d2-4525-4e8f-afe5-b8e5b30fd2b3" />
 
 - Private keys are no longer mandatory; public keys can also be used. When using a public key, the UI mode variable must be set to true.
     <img width="480" alt="Screenshot 2025-01-23 at 15 21 14" src="https://github.com/user-attachments/assets/dba0a627-f5dd-4da8-a161-929b26764a96" />
# NexWallet Deployment Guide

This guide explains how to set up and deploy the NexWallet application using GitHub Actions and a self-hosted runner.

## Project Structure

- `backend/`: Backend API service
- `frontend_app/`: Frontend React application
- `.github/workflows/`: GitHub Actions workflow definitions

## Prerequisites

- A server with Docker and Docker Compose installed
- GitHub account with access to this repository
- Docker Hub account

## Server Setup

### 1. Install Docker and Docker Compose

If not already installed:

```sh
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Set Up GitHub Self-Hosted Runner

1. On GitHub, go to your repository → Settings → Actions → Runners
2. Click "New self-hosted runner"
3. Choose your operating system and architecture
4. Follow the instructions to download and configure the runner on your server

Example for Linux:

```sh
# Create a folder for the runner
mkdir actions-runner && cd actions-runner

# Download the runner package
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configure the runner
./config.sh --url https://github.com/YOUR_USERNAME/NexWallet --token YOUR_TOKEN

# Install and start the runner as a service
sudo ./svc.sh install
sudo ./svc.sh start
```

### 3. Prepare the Project Directory

```sh
# Create the project directory
mkdir -p /opt/nexwallet
cd /opt/nexwallet

# Make sure the GitHub Actions runner has permissions to this directory
sudo chown -R RUNNER_USER:RUNNER_USER /opt/nexwallet
```

## GitHub Secrets Setup

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Docker Hub Credentials
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password

### Common API and Service Keys
- `OPEN_AI_KEY`: OpenAI API key
- `OPENAI_API_KEY`: Alternative OpenAI API key
- `REOWN_KEY`: Reown service key
- `SECRET_KEY`: Secret key for JWT authentication
- `GRAPH_API_KEY`: GraphQL API key
- `COOKIE_API_KEY`: Cookie API key

### Solana-related Variables
- `RPC_URL`: Solana RPC URL
- `SOLANA_PRIVATE_KEY`: Solana private key
- `SOLANA_RPC_URL`: Solana RPC URL (same as RPC_URL)
- `HELIUS_API_KEY`: Helius API key for Solana
- `FLEXLEND_API_KEY`: FlexLend API key
- `PARA_API_KEY`: Para API key

### Jupiter Protocol Variables
- `JUPITER_REFERRAL_ACCOUNT`: Jupiter referral account
- `JUPITER_FEE_BPS`: Jupiter fee basis points

### OpenAI Variables
- `OPEN_AI_AGENT_KEY`: OpenAI Agent key

### Privy Authentication Variables
- `NEXT_PUBLIC_PRIVY_APP_ID`: Privy app ID
- `PRIVY_CLIENT_ID`: Privy client ID
- `PRIVY_CLIENT_SECRET`: Privy client secret
- `PRIVY_API_URL`: Privy API URL
- `PRIVY_VERIFICATION_KEY`: Privy verification key (multi-line)

### Database Variables
- `CONNECTION_STRING`: Full database connection string
- `DB_USER`: Database username
- `DB_PASS`: Database password
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name

### Twitter API Variables
- `TWITTER_API_KEY`: Twitter API key
- `TWITTER_API_SECRET`: Twitter API secret
- `TWITTER_ACCESS_TOKEN`: Twitter access token
- `TWITTER_ACCESS_TOKEN_SECRET`: Twitter access token secret
- `TWITTER_CLIENT_ID`: Twitter client ID
- `TWITTER_CLIENT_SECRET`: Twitter client secret

### CDP API Variables
- `CDP_API_KEY_NAME`: CDP API key name
- `CDP_API_KEY_PRIVATE_KEY`: CDP API private key (multi-line)
- `NETWORK_ID`: Network ID for CDP

### Gaianet Variables
- `GAIANET_API_KEY`: Gaianet API key

### Frontend-specific Variables
- `BACKEND_API_URL`: URL for the frontend to access the backend API

## How It Works

1. When you push to the main branch, GitHub Actions will:
   - Check out the code on your self-hosted runner
   - Create .env files with secrets from GitHub
   - Build and push Docker images to Docker Hub
   - Deploy the application using docker-compose

2. The deployment uses environment variables loaded from .env files for each service.

## Manual Deployment (if needed)

If you need to manually deploy:

```sh
cd /opt/nexwallet

# Create .env files (with all variables as shown in the GitHub Secrets section)
# For brevity, this example shows just a few key variables
cat > ./backend/.env << EOF
OPEN_AI_KEY=your_openai_key_here
SECRET_KEY=your_secret_key_here
CONNECTION_STRING=your_db_connection_string_here
# ... add all other variables
EOF

cat > ./frontend_app/.env << EOF
OPEN_AI_KEY=your_openai_key_here
BACKEND_API_URL=your_backend_url_here
# ... add all other variables
EOF

# Deploy with docker-compose
docker-compose pull
docker-compose up -d
```

## Troubleshooting

- Check GitHub Actions logs for errors
- Verify the runner is online and working
- Check Docker logs: `docker-compose logs`
- Ensure all secrets are properly set in GitHub repository settings 