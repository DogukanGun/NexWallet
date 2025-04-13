# API Encryption

This directory contains utilities for encrypting requests from our Next.js API routes to the backend server.

## Architecture

Our app uses the following flow:
1. App components call ApiService methods
2. ApiService methods call Next.js API routes (pages/api/*)
3. Next.js API routes call the backend server with encrypted payloads

## How Encryption Works

We use RSA asymmetric encryption to encrypt request bodies:
1. The frontend uses a public key to encrypt request bodies
2. The backend uses its private key to decrypt them

## Using encryptedFetch

The `encryptedFetch` utility function handles encryption for you. Here's how to use it:

```typescript
import { encryptedFetch } from '../utils/encryptedFetch';

// Example GET request
const data = await encryptedFetch('/some/endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// Example POST request with a body
const data = await encryptedFetch('/some/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ some: 'data' }), // This will be encrypted
});
```

## Automatic Conversion

You can use the script `scripts/update-api-with-encryption.ts` to automatically update all API routes to use `encryptedFetch`:

```bash
npx ts-node scripts/update-api-with-encryption.ts
```

## Notes

- Encryption only applies to the request body, not headers or URL parameters
- The public key is initialized in the root middleware.ts file
- If encryption fails, the request will fall back to an unencrypted request 