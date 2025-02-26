import { prisma } from '@/app/helper/PrismaHelper';
import { NextApiRequest, NextApiResponse } from 'next';


const handler = async(req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === 'POST'){
        const { code, walletAddress } = req.body;
        console.log("walletAddress", walletAddress)
        console.log("code", code)
        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }
        try {
            const userCode = await prisma.specialUserCodes.findFirst({
                where: {
                    code: code,
                    is_used: false,
                },
            });
            console.log("userCode", userCode)
            if (userCode) {
                const usercodeResponse = await prisma.specialUserCodes.update({
                    where: {
                        id: userCode.id,
                    },
                    data: {
                        is_used: true,
                        used_by:walletAddress
                    },
                })
                console.log("usercodeResponse", usercodeResponse)
                if(!usercodeResponse){
                    return res.status(200).json({ exists: false });
                }
                
                const registerUserResponse = await prisma.registeredUsers.create({
                    data:{
                        user_wallet: walletAddress
                    }
                })
                console.log("registerUserResponse", registerUserResponse)
                if(!registerUserResponse){
                    return res.status(404).json({ exists: false });
                }

                return res.status(200).json({ exists: true });

            } else {
                return res.status(200).json({ exists: false });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }
}

export default handler;