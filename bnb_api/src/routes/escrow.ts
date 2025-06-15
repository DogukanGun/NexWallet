import { FastifyPluginAsync } from 'fastify';
import { Escrow, EscrowStatus, IEscrow } from '../models/Escrow';
import { contractService } from '../services/contractService';
import { aiService } from '../services/aiService';

export const escrowRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Get all escrow requests with filters
  fastify.get('/', async (request, reply) => {
    try {
      const { 
        status, 
        requesterAddress, 
        payerAddress, 
        page = 1, 
        limit = 20 
      } = request.query as any;

      const filter: any = {};
      if (status) filter.status = status;
      if (requesterAddress) filter.requesterAddress = requesterAddress;
      if (payerAddress) filter.payerAddress = payerAddress;

      const escrows = await Escrow.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean();

      const total = await Escrow.countDocuments(filter);

      return {
        success: true,
        data: escrows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      };
    } catch (error) {
      fastify.log.error('Error fetching escrows:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch escrows'
      });
    }
  });

  // Get active/open escrow requests
  fastify.get('/active', async (request, reply) => {
    try {
      const escrows = await Escrow.find({
        status: EscrowStatus.OPEN,
        expiresAt: { $gt: new Date() }
      })
      .sort({ createdAt: -1 })
      .lean();

      return {
        success: true,
        data: escrows
      };
    } catch (error) {
      fastify.log.error('Error fetching active escrows:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch active escrows'
      });
    }
  });

  // Get escrow by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      
      const escrow = await Escrow.findOne({
        $or: [
          { _id: id },
          { requestId: id },
          { contractAddress: id }
        ]
      }).lean();

      if (!escrow) {
        return reply.status(404).send({
          success: false,
          error: 'Escrow not found'
        });
      }

      return {
        success: true,
        data: escrow
      };
    } catch (error) {
      fastify.log.error('Error fetching escrow:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch escrow'
      });
    }
  });

  // Create new escrow request
  fastify.post('/', async (request, reply) => {
    try {
      const escrowData = request.body as any;

      // Validate required fields
      const requiredFields = [
        'requesterAddress', 'tokenAddress', 'tokenAmount',
        'fiatAmount', 'fiatCurrency', 'bankDetails',
        'description', 'receiptRequirements'
      ];

      for (const field of requiredFields) {
        if (!escrowData[field]) {
          return reply.status(400).send({
            success: false,
            error: `Missing required field: ${field}`
          });
        }
      }

      // Create escrow on blockchain first
      const contractResult = await contractService.createEscrowRequest(escrowData);
      
      if (!contractResult.success) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to create escrow on blockchain',
          details: contractResult.error
        });
      }

      // Save to database
      const escrow = new Escrow({
        ...escrowData,
        requestId: contractResult.requestId,
        contractAddress: contractResult.contractAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: EscrowStatus.OPEN
      });

      await escrow.save();

      return {
        success: true,
        data: escrow,
        contractAddress: contractResult.contractAddress,
        transactionHash: contractResult.transactionHash
      };
    } catch (error) {
      fastify.log.error('Error creating escrow:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create escrow'
      });
    }
  });

  // Accept escrow request
  fastify.post('/:id/accept', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { payerAddress } = request.body as any;

      if (!payerAddress) {
        return reply.status(400).send({
          success: false,
          error: 'Payer address is required'
        });
      }

      const escrow = await Escrow.findOne({
        $or: [{ _id: id }, { requestId: id }]
      });

      if (!escrow) {
        return reply.status(404).send({
          success: false,
          error: 'Escrow not found'
        });
      }

      if (escrow.status !== EscrowStatus.OPEN) {
        return reply.status(400).send({
          success: false,
          error: 'Escrow is not available for acceptance'
        });
      }

      if (new Date() > escrow.expiresAt) {
        return reply.status(400).send({
          success: false,
          error: 'Escrow has expired'
        });
      }

      // Accept on blockchain
      const contractResult = await contractService.acceptEscrowRequest(
        escrow.contractAddress,
        escrow.requestId,
        payerAddress
      );

      if (!contractResult.success) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to accept escrow on blockchain',
          details: contractResult.error
        });
      }

      // Update database
      escrow.payerAddress = payerAddress;
      escrow.status = EscrowStatus.ACCEPTED;
      await escrow.save();

      return {
        success: true,
        data: escrow,
        transactionHash: contractResult.transactionHash
      };
    } catch (error) {
      fastify.log.error('Error accepting escrow:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to accept escrow'
      });
    }
  });

  // Submit payment proof
  fastify.post('/:id/submit-proof', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { receiptFileUrl, receiptFileName } = request.body as any;

      if (!receiptFileUrl) {
        return reply.status(400).send({
          success: false,
          error: 'Receipt file URL is required'
        });
      }

      const escrow = await Escrow.findOne({
        $or: [{ _id: id }, { requestId: id }, { contractAddress: id }]
      });

      if (!escrow) {
        return reply.status(404).send({
          success: false,
          error: 'Escrow not found'
        });
      }

      if (escrow.status !== EscrowStatus.ACCEPTED) {
        return reply.status(400).send({
          success: false,
          error: 'Escrow is not in accepted state'
        });
      }

      // Update escrow with receipt info
      escrow.receiptFileUrl = receiptFileUrl;
      escrow.receiptFileName = receiptFileName;
      escrow.status = EscrowStatus.RECEIPT_SUBMITTED;
      escrow.paidAt = new Date();
      await escrow.save();

      // Trigger AI verification
      aiService.verifyReceipt(escrow.id)
        .catch(error => {
          fastify.log.error('AI verification failed:', error);
        });

      return {
        success: true,
        data: escrow,
        message: 'Receipt submitted successfully. AI verification in progress.'
      };
    } catch (error) {
      fastify.log.error('Error submitting proof:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to submit proof'
      });
    }
  });

  // Get user's escrow requests
  fastify.get('/user/:address/requests', async (request, reply) => {
    try {
      const { address } = request.params as any;
      
      const escrows = await Escrow.find({
        requesterAddress: address
      })
      .sort({ createdAt: -1 })
      .lean();

      return {
        success: true,
        data: escrows
      };
    } catch (error) {
      fastify.log.error('Error fetching user requests:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch user requests'
      });
    }
  });

  // Get user's payments
  fastify.get('/user/:address/payments', async (request, reply) => {
    try {
      const { address } = request.params as any;
      
      const escrows = await Escrow.find({
        payerAddress: address
      })
      .sort({ createdAt: -1 })
      .lean();

      return {
        success: true,
        data: escrows
      };
    } catch (error) {
      fastify.log.error('Error fetching user payments:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch user payments'
      });
    }
  });

  // Cancel escrow (requester only)
  fastify.post('/:id/cancel', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { requesterAddress } = request.body as any;

      const escrow = await Escrow.findOne({
        $or: [{ _id: id }, { requestId: id }]
      });

      if (!escrow) {
        return reply.status(404).send({
          success: false,
          error: 'Escrow not found'
        });
      }

      if (escrow.requesterAddress !== requesterAddress) {
        return reply.status(403).send({
          success: false,
          error: 'Only the requester can cancel the escrow'
        });
      }

      if (escrow.status !== EscrowStatus.OPEN) {
        return reply.status(400).send({
          success: false,
          error: 'Can only cancel open escrows'
        });
      }

      // Cancel on blockchain
      const contractResult = await contractService.cancelEscrowRequest(
        escrow.contractAddress,
        escrow.requestId
      );

      if (!contractResult.success) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to cancel escrow on blockchain',
          details: contractResult.error
        });
      }

      // Update database
      escrow.status = EscrowStatus.CANCELLED;
      await escrow.save();

      return {
        success: true,
        data: escrow,
        transactionHash: contractResult.transactionHash
      };
    } catch (error) {
      fastify.log.error('Error cancelling escrow:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to cancel escrow'
      });
    }
  });

  // Raise dispute
  fastify.post('/:id/dispute', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { userAddress, reason } = request.body as any;

      const escrow = await Escrow.findOne({
        $or: [{ _id: id }, { requestId: id }]
      });

      if (!escrow) {
        return reply.status(404).send({
          success: false,
          error: 'Escrow not found'
        });
      }

      const isParty = escrow.requesterAddress === userAddress || 
                     escrow.payerAddress === userAddress;

      if (!isParty) {
        return reply.status(403).send({
          success: false,
          error: 'Only parties involved can raise a dispute'
        });
      }

      if (![EscrowStatus.ACCEPTED, EscrowStatus.RECEIPT_SUBMITTED].includes(escrow.status)) {
        return reply.status(400).send({
          success: false,
          error: 'Cannot dispute at this stage'
        });
      }

      // Raise dispute on blockchain
      const contractResult = await contractService.raiseDispute(
        escrow.contractAddress,
        escrow.requestId
      );

      if (!contractResult.success) {
        return reply.status(500).send({
          success: false,
          error: 'Failed to raise dispute on blockchain',
          details: contractResult.error
        });
      }

      // Update database
      escrow.isDisputed = true;
      escrow.disputeReason = reason;
      escrow.status = EscrowStatus.DISPUTED;
      await escrow.save();

      return {
        success: true,
        data: escrow,
        transactionHash: contractResult.transactionHash
      };
    } catch (error) {
      fastify.log.error('Error raising dispute:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to raise dispute'
      });
    }
  });
}; 