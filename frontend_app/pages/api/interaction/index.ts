import { prisma } from '@/app/helper/PrismaHelper';
import { withAuth } from '@/middleware/withAuth';
import { NextApiRequest, NextApiResponse } from 'next';


const handler = async(req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        try {
            const {data} = req.body;
            const savedData = await prisma.interaction.create({
                data: data,
            });
            res.status(200).json(savedData);
        } catch (error) {
            res.status(500).json({ error: 'Error saving data to the database' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

export default withAuth(handler);