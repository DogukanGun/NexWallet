import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/app/helper/PrismaHelper';
import { ethers } from 'ethers';
import { PrivyClient } from "@privy-io/server-auth";
import {
    CdpWalletProvider,
  } from "@coinbase/agentkit";
import { CdpAgentkit } from '@coinbase/cdp-agentkit-core';
import { Coinbase } from '@coinbase/coinbase-sdk/dist/coinbase/coinbase';
// Function to validate SPKI format
const isValidSPKI = (key: string): boolean => {
    return key.startsWith('-----BEGIN PUBLIC KEY-----') && key.endsWith('-----END PUBLIC KEY-----');
}

// Function to clean up the PEM key
const cleanPEM = (key: string): string => {
    return key.replace(/\\n/g, '\n').replace(/\s+/g, ' ').trim();
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const accessToken = req.headers.authorization?.split(' ')[1];
        const iWallet = ethers.Wallet.createRandom();
        const mnemonic = iWallet.mnemonic?.phrase;
        if (!accessToken) {
            return res.status(400).json({ error: 'Missing parameters' });
        }
        const verificationKey = cleanPEM(process.env.PRIVY_VERIFICATION_KEY!);
        if (!isValidSPKI(verificationKey)) {
            console.error('Invalid PRIVY_VERIFICATION_KEY format');
            return res.status(500).json({ error: 'Invalid verification key format' });
        }
        const privy = new PrivyClient(
            process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
            process.env.PRIVY_CLIENT_SECRET!
        );
        const verifiedClaims = await privy.verifyAuthToken(
            accessToken,
            verificationKey
        );
        const userWallet = await prisma.arbitrumWallets.findFirst({
            where: {
                wallet_address: verifiedClaims.userId,
            }
        });
        if (userWallet) {
            return res.status(200).json({ error: 'Wallet already exists' });
        }
        await prisma.arbitrumWallets.create({
            data: {
                wallet_address: verifiedClaims.userId,
                private_key: iWallet.privateKey,
                mnemonic: mnemonic || "",
            }
        });

        return res.status(200).json({ message: 'Wallet created successfully', walletAddress: iWallet.address });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return 
    }
}