import { NextApiRequest, NextApiResponse } from 'next';

const handler = async(req: NextApiRequest, res: NextApiResponse) => {
    if(req.method !== 'POST'){
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const { code, walletAddress } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    try {
        // We need to create a new endpoint in the backend for this specific functionality
        const response = await fetch(`${process.env.BACKEND_API_URL}/auth/code/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, walletAddress }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error checking code:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default handler;