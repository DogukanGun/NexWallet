import express, { Request, Response, NextFunction } from 'express';
import {
  getOrCreateWallet,
  getWalletBalance,
  buildPaymentTransaction,
  buildTrustlineTransaction,
  buildRemoveTrustlineTransaction,
  buildSwapTransaction,
  buildMergeAccountTransaction,
  buildSponsoredAccountTransaction,
  buildFeeBumpTransaction,
  buildPaymentWithMemoTransaction,
  buildMultiSigTransaction,
  buildCreateClaimableBalanceTransaction,
  buildClaimBalanceTransaction
} from '../wallet';
import { apiLimiter, strictLimiter } from '../middleware/rateLimit';
import { isValidPublicKey, isValidAmount } from '../utils/validation';

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Basic validation middleware
const validatePublicKey = (req: Request, res: Response, next: NextFunction) => {
  const publicKey = req.body.publicKey || req.body.sourcePublicKey;
  if (!publicKey || !isValidPublicKey(publicKey)) {
    res.status(400).json({ error: 'Invalid public key' });
    return;
  }
  next();
};

const validateAmount = (req: Request, res: Response, next: NextFunction) => {
  const amount = req.body.amount;
  if (!amount || !isValidAmount(amount)) {
    res.status(400).json({ error: 'Invalid amount' });
    return;
  }
  next();
};

// Regular routes with basic rate limiting
router.post('/', apiLimiter, async (req: Request, res: Response) => {
  try {
    const { twitterId } = req.body;
    const wallet = await getOrCreateWallet(twitterId);
    res.json(wallet);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/balance', validatePublicKey, async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.body;
    const balance = await getWalletBalance(publicKey);
    res.json(balance);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Payment operations with amount validation
router.post('/payment', [validatePublicKey, validateAmount], async (req: Request, res: Response) => {
  try {
    const { sourcePublicKey, destinationPublicKey, amount, assetCode, assetIssuer } = req.body;
    const xdr = await buildPaymentTransaction(sourcePublicKey, destinationPublicKey, amount, assetCode, assetIssuer);
    res.send(xdr);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Sensitive operations with strict rate limiting
router.post('/trustline', [strictLimiter, validatePublicKey], async (req: Request, res: Response) => {
  try {
    const { publicKey, assetCode, assetIssuer } = req.body;
    const xdr = await buildTrustlineTransaction(publicKey, assetCode, assetIssuer);
    res.send(xdr);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/trustline/remove', [strictLimiter, validatePublicKey], async (req: Request, res: Response) => {
  try {
    const { publicKey, assetCode, assetIssuer } = req.body;
    const xdr = await buildRemoveTrustlineTransaction(publicKey, assetCode, assetIssuer);
    res.send(xdr);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/swap', [validatePublicKey, validateAmount], async (req: Request, res: Response) => {
  try {
    const { sourcePublicKey, fromAsset, toAsset, amount, minDestAmount } = req.body;
    const xdr = await buildSwapTransaction(sourcePublicKey, fromAsset, toAsset, amount, minDestAmount);
    res.send(xdr);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Multi-signature operations with strict rate limiting
router.post('/multisig', [strictLimiter, validatePublicKey], async (req: Request, res: Response) => {
  try {
    const { publicKey, signerPublicKey, weight, masterWeight, lowThreshold, medThreshold, highThreshold } = req.body;
    const xdr = await buildMultiSigTransaction(
      publicKey,
      signerPublicKey,
      weight,
      masterWeight,
      lowThreshold,
      medThreshold,
      highThreshold
    );
    res.send(xdr);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Claimable balance operations
router.post('/claimable-balance/create', [validatePublicKey, validateAmount], async (req: Request, res: Response) => {
  try {
    const { sourcePublicKey, destinationPublicKey, amount, assetCode, assetIssuer, claimAfterSeconds } = req.body;
    const xdr = await buildCreateClaimableBalanceTransaction(
      sourcePublicKey,
      destinationPublicKey,
      amount,
      assetCode,
      assetIssuer,
      claimAfterSeconds
    );
    res.send(xdr);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/claimable-balance/claim', validatePublicKey, async (req: Request, res: Response) => {
  try {
    const { publicKey, balanceId } = req.body;
    const xdr = await buildClaimBalanceTransaction(publicKey, balanceId);
    res.send(xdr);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Existing routes...
router.post('/merge', [strictLimiter, validatePublicKey], async (req: Request, res: Response) => {
  try {
    const { sourcePublicKey, destinationPublicKey } = req.body;
    const xdr = await buildMergeAccountTransaction(sourcePublicKey, destinationPublicKey);
    res.send(xdr);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/sponsored-account', [strictLimiter, validatePublicKey], async (req: Request, res: Response) => {
  try {
    const { sponsorPublicKey, newAccountPublicKey } = req.body;
    const xdr = await buildSponsoredAccountTransaction(sponsorPublicKey, newAccountPublicKey);
    res.send(xdr);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/fee-bump', validatePublicKey, async (req: Request, res: Response) => {
  try {
    const { feeSourcePublicKey, innerTxXDR, baseFee } = req.body;
    const xdr = await buildFeeBumpTransaction(feeSourcePublicKey, innerTxXDR, baseFee);
    res.send(xdr);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/payment-with-memo', [validatePublicKey, validateAmount], async (req: Request, res: Response) => {
  try {
    const { sourcePublicKey, destinationPublicKey, amount, assetCode, assetIssuer, memo } = req.body;
    const xdr = await buildPaymentWithMemoTransaction(
      sourcePublicKey,
      destinationPublicKey,
      amount,
      memo,
      assetCode,
      assetIssuer
    );
    res.send(xdr);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router; 