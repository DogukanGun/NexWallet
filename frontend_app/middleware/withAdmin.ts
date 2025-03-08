import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { verifyJWT } from '@/lib/jwt';
import { prisma } from '@/app/helper/PrismaHelper';
import { AdminPayload } from '@/pages/api/user/admin';


export const withAdmin =
    (handler: NextApiHandler) =>
        async (req: NextApiRequest, res: NextApiResponse) => {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Missing or invalid Authorization header' });
            }

            const token = authHeader.split(' ')[1];

            try {
                const payload = verifyJWT(token) as AdminPayload;
                const user = await prisma.admins.findFirst({
                    where: { user_id: payload.user_id },
                });
                if (!user) return res.status(401).json({ error: 'Invalid or expired token' });
                return handler(req, res);
            } catch (error) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
        };
