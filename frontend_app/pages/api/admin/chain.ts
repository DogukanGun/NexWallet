import { NextApiRequest, NextApiResponse } from 'next';

export type AdminPayload = {
    user_id: string;
    iat: number;
    exp: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const backendUrl = `${process.env.BACKEND_API_URL}/admin/chain`;
    
    try {
        // Handle different HTTP methods
        if (req.method === 'POST') {
            const { name } = req.body;
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name, 
                    icon:'', 
                    is_embedded: false,
                    disabled: false 
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                return res.status(response.status).json(data);
            }

            return res.status(200).json(data);
        } 
        else if (req.method === 'GET') {
            const response = await fetch(backendUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                return res.status(response.status).json(data);
            }

            return res.status(200).json(data);
        } 
        else if (req.method === 'DELETE') {
            const chainId = req.query.id as string;
            if (!chainId) {
                return res.status(400).json({ error: 'Chain ID is required' });
            }
            
            const response = await fetch(`${backendUrl}/${chainId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                return res.status(response.status).json(data);
            }

            return res.status(200).json(data);
        } 
        else if (req.method === 'PUT') {
            const chainId = req.query.id as string;
            const action = req.query.action as string;
            
            if (!chainId || !action) {
                return res.status(400).json({ error: 'Chain ID and action are required' });
            }
            
            if (action !== 'enable' && action !== 'disable') {
                return res.status(400).json({ error: 'Action must be either enable or disable' });
            }
            
            const response = await fetch(`${backendUrl}/${action}/${chainId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                return res.status(response.status).json(data);
            }

            return res.status(200).json(data);
        } 
        else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error proxying request to backend:', error);
        return res.status(500).json({ error: 'Failed to communicate with backend API' });
    }
}

export default handler;