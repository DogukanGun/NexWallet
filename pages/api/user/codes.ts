import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/app/helper/PrismaHelper';
import { generateRandomString } from '@/lib/random';
import { withAdmin } from '@/middleware/withAdmin';


const handler = async(req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        // Add cache control headers to prevent caching
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        
        const codes = await prisma.specialUserCodes.findMany(
            {
                select:{
                    code: true,
                    used_by: true,
                    is_used: true,
                    id: true,
                }
            }
        );
        return res.status(200).json({ code: codes, timestamp: new Date().toISOString() });
    } else {
         // Handle POST request
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default withAdmin(handler);