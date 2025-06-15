import { FastifyPluginAsync } from 'fastify';
import { pipeline } from 'stream/promises';
import { createWriteStream, unlinkSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { config } from '../config/config';

export const fileRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Upload receipt file to IPFS
  fastify.post('/upload-receipt', async (request, reply) => {
    try {
      const data = await request.file({
        limits: {
          fileSize: config.MAX_FILE_SIZE,
          files: 1
        }
      });

      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'No file provided'
        });
      }

      // Validate file type
      const allowedTypes = config.ALLOWED_FILE_TYPES;
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          success: false,
          error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      // Generate unique filename
      const fileExtension = data.filename.split('.').pop() || 'jpg';
      const uniqueFilename = `${randomUUID()}.${fileExtension}`;
      const tempPath = join(process.cwd(), 'temp', uniqueFilename);

      // Save file temporarily
      await pipeline(data.file, createWriteStream(tempPath));

      try {
        // Upload to IPFS
        const ipfsHash = await uploadToIPFS(tempPath);
        
        // Clean up temp file
        unlinkSync(tempPath);

        const fileUrl = `${config.IPFS_GATEWAY_URL}${ipfsHash}`;

        return {
          success: true,
          data: {
            filename: data.filename,
            originalName: data.filename,
            mimetype: data.mimetype,
            size: (await import('fs')).statSync(tempPath).size,
            ipfsHash,
            fileUrl
          }
        };
      } catch (ipfsError) {
        // Clean up temp file on error
        try {
          unlinkSync(tempPath);
        } catch {}
        
        throw ipfsError;
      }
    } catch (error: any) {
      fastify.log.error('File upload error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to upload file'
      });
    }
  });

  // Get file info from IPFS hash
  fastify.get('/info/:hash', async (request, reply) => {
    try {
      const { hash } = request.params as any;
      
      const fileUrl = `${config.IPFS_GATEWAY_URL}${hash}`;
      
      // Try to get file metadata (this would need actual IPFS client)
      return {
        success: true,
        data: {
          hash,
          fileUrl,
          available: true
        }
      };
    } catch (error: any) {
      fastify.log.error('File info error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get file info'
      });
    }
  });
};

// Helper function to upload to IPFS
async function uploadToIPFS(filePath: string): Promise<string> {
  try {
    // This is a mock implementation
    // In a real implementation, you would use ipfs-http-client
    // const { create } = require('ipfs-http-client');
    // const ipfs = create({ url: config.IPFS_API_URL });
    // const { path } = await ipfs.add(fs.readFileSync(filePath));
    // return path;
    
    // For now, return a mock hash
    const mockHash = `Qm${randomUUID().replace(/-/g, '').substring(0, 44)}`;
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockHash;
  } catch (error) {
    throw new Error(`IPFS upload failed: ${error}`);
  }
} 