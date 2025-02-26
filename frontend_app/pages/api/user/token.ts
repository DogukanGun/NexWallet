import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';


export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        const token = jwt.sign({ walletAddress }, process.env.SECRET_KEY!, { expiresIn: '1h' });

        return res.status(200).json({ token });
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}