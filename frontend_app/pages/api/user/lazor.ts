import { lazorMessage } from "@/constants";
import { NextApiResponse, NextApiRequest } from "next";
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import jwt from 'jsonwebtoken';
import { prisma } from "@/app/helper/PrismaHelper";
import bs58 from 'bs58';
import { p256 } from '@noble/curves/p256';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { publicKey, signature } = req.body;

    if (!publicKey || !signature) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('Received public key:', publicKey);
    console.log('Received signature:', signature);

    try {

        const publicKeyBuffer = Buffer.from(publicKey, 'base64');  // 33-byte compressed P-256 key
        const signatureBuffer = Buffer.from(signature, 'base64');
        const messageBuffer = Buffer.from("your message here", 'utf-8');

        const isValid = p256.verify(signatureBuffer, messageBuffer, publicKeyBuffer);

        // Create a JWT token with the public key
        const token = jwt.sign(
            {
                publicKey: publicKey.toString(),
                // Add timestamp to prevent token reuse
                iat: Math.floor(Date.now() / 1000)
            },
            process.env.SECRET_KEY!,
            { expiresIn: '24h' }
        );

        const response = await fetch(`${process.env.BACKEND_API_URL}/auth/save/lazor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: publicKey,
                username: publicKey
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.log('Error:', data);
            return res.status(response.status).json(data);
        }


        // Set JWT as HTTP-only cookie
        if (isValid) {
            return res.status(200).json({
                ok: true,
                token: token,
                user: {
                    id: data!.id,
                    username: data!.username
                }
            });
        } else {
            return res.status(400).json({ error: 'Invalid public key length for Secp256r1' });
        }

    } catch (err) {
        console.error('Error verifying signature:', err);
        return res.status(500).json({ error: 'Error verifying signature' });
    }
}
