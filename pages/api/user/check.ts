import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/app/helper/PrismaHelper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    try {
        console.log("req.body", req.body);
        const { userWallet, did } = req.body;

        // Check if both userWallet and did are null
        if (!userWallet && !did) {
            return res.status(400).json({ error: 'Both userWallet and did cannot be null' });
        }

        // Construct the where clause properly for Prisma
        const where = did && userWallet
            ? {
                OR: [
                    { user_wallet: userWallet },
                    { user_wallet: did }
                ]
            }
            : { user_wallet: did || userWallet };

        console.log('Query where clause:', where);
        
        const user = await prisma.registeredUsers.findFirst({
            where,
            select: {
                user_wallet: true
            }
        });

        console.log('Found user:', user);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ 
            message: 'User check successful', 
            isAllowed: user.user_wallet !== null && user.user_wallet !== undefined 
        });

    } catch (error) {
        console.error('Error in user check:', error);
        return res.status(500).json({ 
            error: 'User check failed', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
}