import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/app/helper/PrismaHelper';
import { generateRandomString } from '@/lib/random';
import { withAdmin } from '@/middleware/withAdmin';


const handler = async(req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        const randomCode = generateRandomString();
        try{
            const code = await prisma.specialUserCodes.create({
                data: {
                    code: randomCode,
                    used_by: ""
                }
            })
            res.status(200).json({ code: code.code });
            return;
        }catch(e){
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
    } else if (req.method === 'DELETE') {
        try{
            const { id } = req.body;
            if (!id) {
                res.status(400).json({ error: 'ID is required' });
                return;
            }
            const deleteResponse = await prisma.specialUserCodes.delete({
                where: {
                    id: Number(id),
                },
            })
            console.log(deleteResponse);
            res.status(200).json({ success: true });
            return;
        }catch(e){
            console.log(e);
            res.status(501).json({ error: 'Internal server errorr', detail: e });
            return;
        }
    } else if (req.method === 'PUT') {
        try{
            const { id } = req.body;
            const markAsUsedResponse = await prisma.specialUserCodes.update({
                where: {
                    id: Number(id),
                },
                data: {
                    is_used: true,
                },
            })
            res.status(200).json({ success: true });
            return;
        }catch(e){
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
    } else {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }
    
        if (req.method === 'GET') {
            // Handle any other HTTP method
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
            return;
        }
        try {
            const userCode = await prisma.specialUserCodes.findFirst({
                where: {
                    code: code,
                    is_used: false,
                },
            });
    
            if (userCode) {
                return res.status(200).json({ exists: true });
            } else {
                return res.status(404).json({ exists: false });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default withAdmin(handler);