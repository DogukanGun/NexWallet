import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { verifyJWT } from '@/lib/jwt';
import { prisma } from '@/app/helper/PrismaHelper';
import { AdminPayload } from '@/pages/api/user/admin';
import { RegisteredUser } from '@prisma/client';
// Define a custom request type to include the authenticated user
export interface AuthenticatedRequest extends NextApiRequest {
    user?: RegisteredUser;
}

export const withAuth =
    (handler: NextApiHandler) =>
        async (req: AuthenticatedRequest, res: NextApiResponse) => {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Missing or invalid Authorization header' });
            }

            const token = authHeader.split(' ')[1];

            try {
                const walletAddress = verifyJWT(token) as AdminPayload;
                console.log(walletAddress);
                const user = await prisma.registeredUser.findFirst({
                    where: { user_id: walletAddress.user_id },
                });
                console.log(user)
                if (!user) return res.status(401).json({ error: 'Invalid or expired token' });
                req.user = user;
                return handler(req, res);
            } catch (error) {
                console.log(error);
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
        };
