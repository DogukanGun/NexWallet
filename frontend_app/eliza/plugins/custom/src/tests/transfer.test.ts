import { describe, it, beforeEach, expect, vi } from 'vitest';
import { generatePrivateKey, Account, privateKeyToAccount } from 'viem/accounts';
import { parseEther, formatEther } from 'viem';

import { TransferAction } from '../actions/transfer';
import { WalletProvider } from '../providers/wallet';
import { TransferParams } from '../types';
import { SupportedChain } from '../types';

describe('Transfer Action', () => {
    let account: Account;
    let wp: WalletProvider;
    let transferAction: TransferAction;
    let mockConfirmTransaction: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        const pk = generatePrivateKey();
        account = privateKeyToAccount(pk);
        wp = new WalletProvider(pk);

        // Mock confirmTransaction to always return true
        mockConfirmTransaction = vi.fn().mockResolvedValue(true);
        wp.confirmTransaction = mockConfirmTransaction;

        // Mock token address resolution
        wp.getTokenAddress = vi.fn().mockImplementation((_chain, symbol) => {
            const addresses = {
                USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            };
            return Promise.resolve(
                addresses[symbol] || '0x0000000000000000000000000000000000000000'
            );
        });

        // Mock public client methods
        const mockPublicClient = {
            getBalance: vi.fn().mockResolvedValue(parseEther('1.0')),
            readContract: vi.fn().mockImplementation(({ functionName }) => {
                if (functionName === 'decimals') return Promise.resolve(18);
                if (functionName === 'symbol') return Promise.resolve('USDC');
                if (functionName === 'balanceOf') return Promise.resolve(parseEther('100'));
                return Promise.resolve(0);
            }),
            simulateContract: vi.fn().mockResolvedValue({ request: {} }),
            waitForTransactionReceipt: vi.fn().mockResolvedValue({}),
        };
        wp.getPublicClient = vi.fn().mockReturnValue(mockPublicClient);

        // Mock wallet client methods
        const mockWalletClient = {
            sendTransaction: vi.fn().mockResolvedValue('0x123'),
            writeContract: vi.fn().mockResolvedValue('0x123'),
        };
        wp.getWalletClient = vi.fn().mockReturnValue(mockWalletClient);

        // Mock formatAddress to reject invalid addresses
        wp.formatAddress = vi.fn().mockImplementation((address) => {
            if (address === '0x0000000000000000000000000000000000000000') {
                throw new Error('Invalid address');
            }
            return address as `0x${string}`;
        });

        transferAction = new TransferAction(wp);
    });

    describe('Native Token Transfer', () => {
        it('should transfer BNB with specific amount', async () => {
            const input: TransferParams = {
                chain: 'bsc',
                token: 'BNB',
                amount: '0.1',
                toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            };

            const resp = await transferAction.transfer(input);

            expect(resp.txHash).toBeDefined();
            expect(resp.txHash).toMatch(/^0x/);
            expect(resp.chain).toBe('bsc');
            expect(resp.token).toBe('BNB');
            expect(resp.amount).toBe('0.1');
            expect(resp.recipient).toBe(input.toAddress);

            // Verify confirmation was called
            expect(mockConfirmTransaction).toHaveBeenCalledWith({
                type: 'transfer',
                from: account.address,
                to: input.toAddress,
                value: input.amount,
                token: 'BNB',
                chainId: wp.getChainConfigs('bsc').id,
            });
        });

        it('should handle transfer all BNB balance', async () => {
            const input: TransferParams = {
                chain: 'bsc',
                token: 'BNB',
                toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            };

            const resp = await transferAction.transfer(input);

            expect(resp.txHash).toBeDefined();
            expect(resp.txHash).toMatch(/^0x/);
            expect(resp.chain).toBe('bsc');
            expect(resp.token).toBe('BNB');
            expect(Number.parseFloat(resp.amount)).toBeGreaterThan(0);
            expect(resp.recipient).toBe(input.toAddress);
        });
    });

    describe('ERC20 Token Transfer', () => {
        it('should transfer USDC with specific amount', async () => {
            const input: TransferParams = {
                chain: 'bsc',
                token: 'USDC',
                amount: '10',
                toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            };

            const resp = await transferAction.transfer(input);

            expect(resp.txHash).toBeDefined();
            expect(resp.txHash).toMatch(/^0x/);
            expect(resp.chain).toBe('bsc');
            expect(resp.token).toBe('USDC');
            expect(resp.amount).toBe('10');
            expect(resp.recipient).toBe(input.toAddress);
        });

        it('should transfer all USDC balance', async () => {
            const input: TransferParams = {
                chain: 'bsc',
                token: 'USDC',
                toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            };

            const resp = await transferAction.transfer(input);

            expect(resp.txHash).toBeDefined();
            expect(resp.txHash).toMatch(/^0x/);
            expect(resp.chain).toBe('bsc');
            expect(resp.token).toBe('USDC');
            expect(Number.parseFloat(resp.amount)).toBeGreaterThanOrEqual(0);
            expect(resp.recipient).toBe(input.toAddress);
        });

        it('should transfer token by contract address', async () => {
            const input: TransferParams = {
                chain: 'bsc',
                token: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC contract on BSC
                amount: '10',
                toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            };

            const resp = await transferAction.transfer(input);

            expect(resp.txHash).toBeDefined();
            expect(resp.txHash).toMatch(/^0x/);
            expect(resp.chain).toBe('bsc');
            expect(resp.token).toBe(input.token);
            expect(resp.amount).toBe('10');
            expect(resp.recipient).toBe(input.toAddress);
        });
    });

    describe('Error Handling', () => {
        it('should throw error for invalid chain', async () => {
            const input: TransferParams = {
                chain: 'invalid_chain' as SupportedChain,
                token: 'BNB',
                amount: '0.1',
                toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            };

            await expect(transferAction.transfer(input)).rejects.toThrow();
        });

        it('should throw error for invalid address', async () => {
            const input: TransferParams = {
                chain: 'bsc',
                token: 'BNB',
                amount: '0.1',
                toAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
            };

            await expect(transferAction.transfer(input)).rejects.toThrow();
        });

        it('should throw error when transaction is rejected', async () => {
            // Mock confirmTransaction to return false
            mockConfirmTransaction.mockResolvedValueOnce(false);

            const input: TransferParams = {
                chain: 'bsc',
                token: 'BNB',
                amount: '0.1',
                toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            };

            await expect(transferAction.transfer(input)).rejects.toThrow(
                'Transfer transaction rejected by user'
            );
        });
    });
});
