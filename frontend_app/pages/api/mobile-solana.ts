import { withAuth } from "@/middleware/withAuth";
import { NextApiRequest, NextApiResponse } from "next";

const INTERNAL_API_URL = process.env.INTERNAL_SOLANA_API_URL || "http://localhost:8004/api/mobile-solana";

/**
 * Mobile-optimized API endpoint that only uses Solana functionality
 * This endpoint is streamlined to have minimal dependencies and faster response times
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'POST': {
      const { message, wallet } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ 
          error: "Message is required and should be a string." 
        });
      }
      if (!wallet || typeof wallet !== "string") {
        return res.status(400).json({ 
          error: "Wallet address is required and should be a string." 
        });
      }
      try {
        // Forward the request to the internal API
        const apiRes = await fetch(INTERNAL_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message, wallet }),
        });
        const data = await apiRes.json();
        return res.status(apiRes.status).json(data);
      } catch (error) {
        console.error("Error forwarding to internal Solana API:", error);
        return res.status(500).json({ 
          error: "Failed to contact internal Solana API",
          text: error instanceof Error ? error.message : "Unknown error",
          success: false
        });
      }
    }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withAuth(handler); 