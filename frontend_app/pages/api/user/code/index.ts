import { NextApiRequest, NextApiResponse } from 'next';

const handler = async(req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    try {
        let url = `${process.env.BACKEND_API_URL}/auth/code`;
        let method = req.method;
        let body = null;

        if (req.method === 'GET') {
            // Generate a new code
            method = 'POST'; // Using POST for code generation in backend
            url = `${url}/generate`;
        } else if (req.method === 'DELETE') {
            // Delete a code
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID is required' });
            }
            body = JSON.stringify({ id });
        } else if (req.method === 'PUT') {
            // Mark code as used
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID is required' });
            }
            url = `${url}/use`;
            body = JSON.stringify({ id });
        } else if (req.method === 'POST') {
            // Check if code exists
            const { code } = req.body;
            if (!code) {
                return res.status(400).json({ error: 'Code is required' });
            }
            url = `${url}/verify`;
            body = JSON.stringify({ code });
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body,
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error handling code operation:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default handler;