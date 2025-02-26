import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/app/helper/PrismaHelper';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // Handle GET request
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);

    } else {
        const dbResForTransaction = await prisma.transaction.create({
            data:{
                transaction_hash: req.body.signature,
                user_wallet: req.body.user_wallet
            }
        })
        if(dbResForTransaction.id === null) {
            res.status(500).json({ error: 'Failed to register subscription', details: dbResForTransaction });
            return;
        }
        const dbResForRegisterUser = await prisma.registeredUsers.create({
            data:{
                user_wallet: req.body.user_wallet
            }
        })
        if(dbResForRegisterUser.id === null) {
            res.status(500).json({ error: 'Failed to register subscription', details: dbResForRegisterUser });
            return;
        }
        res.status(200).json({ message: 'Subscription registered successfully', user: dbResForRegisterUser });
    }
}