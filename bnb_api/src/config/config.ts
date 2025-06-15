import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/autopayer',
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/autopayer_test',

  // Server
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Blockchain
  BNB_RPC_URL: process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.org/',
  AUTOPAYER_CONTRACT_ADDRESS: process.env.AUTOPAYER_CONTRACT_ADDRESS || '',
  PRIVATE_KEY: process.env.PRIVATE_KEY || '',

  // AI Services
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  // IPFS
  IPFS_API_URL: process.env.IPFS_API_URL || 'http://localhost:5001',
  IPFS_GATEWAY_URL: process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(','),

  // Rate Limiting
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
}; 