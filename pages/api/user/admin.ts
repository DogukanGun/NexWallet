import { message } from '@/app/components/ButtonClass';
import { prisma } from '@/app/helper/PrismaHelper';
import { PublicKey } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';
import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";
import jwt from 'jsonwebtoken';
import { verifyJWT } from '@/lib/jwt';

export type AdminPayload = {
    walletAddress: string;
    iat: number;
    exp: number;
}


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { walletAddress, signature } = req.body;

        if (!walletAddress || !signature) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const publicKeyObj = new PublicKey(walletAddress);

        const messageBytes = decodeUTF8(message);
        const signatureUint8 = new Uint8Array(signature);

        // Verify the signature
        const isValid = nacl.sign.detached.verify(
            messageBytes,
            signatureUint8,
            publicKeyObj.toBytes(),
        );

        if (!isValid) {
            return res.status(403).json({ error: 'Invalid signature' });
        }

        const admin = await prisma.admins.findUnique({
            where: {
                wallet_address: walletAddress
            }
        })
        console.log(admin)
        if (!admin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const token = jwt.sign({ walletAddress }, process.env.SECRET_KEY!, { expiresIn: '1h' });

        res.status(200).json({ message: 'Authorized', token, isAdmin: true });
        return
    }else if (req.method === 'GET') {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const decoded = verifyJWT(token) as AdminPayload;
        const admin = await prisma.admins.findUnique({
            where: {
                wallet_address: decoded.walletAddress
            }
        })

        if (!admin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.status(200).json({ message: 'Authorized', isAdmin: true });
        return
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }

}

export default handler;