"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BNBChainPlugin = void 0;
/**
 * BNB Chain Plugin for Eliza
 * Integrates with the BNB Chain ecosystem for blockchain interactions
 */
var BNBChainPlugin = /** @class */ (function () {
    function BNBChainPlugin() {
        this.id = 'bnb-chain-plugin';
        this.name = 'BNB Chain';
        this.version = '1.0.0';
        this.description = 'Integrates with BNB Chain - Ethereum-compatible blockchain';
        this.isConnected = false;
        this.chainId = 56; // BNB Smart Chain Mainnet
        this.connectedWallet = null;
    }
    /**
     * Initialize the plugin
     * @param elizaService The Eliza service
     */
    BNBChainPlugin.prototype.initialize = function (elizaService) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('BNB Chain plugin initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.connect()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to connect to BNB Chain:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Connect to the BNB Chain network
     */
    BNBChainPlugin.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // In a real implementation, this would verify connection to the BNB Chain
                    // For demo purposes, we're just simulating success
                    // const response = await axios.post(this.rpcUrl, {
                    //   jsonrpc: '2.0',
                    //   id: 1,
                    //   method: 'eth_chainId',
                    //   params: []
                    // });
                    // this.isConnected = response.data.result && parseInt(response.data.result, 16) === this.chainId;
                    this.isConnected = true;
                    console.log('Connected to BNB Chain');
                }
                catch (error) {
                    this.isConnected = false;
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Connect to a wallet (MetaMask, Trust Wallet, etc.)
     * @returns The wallet's selected address
     */
    BNBChainPlugin.prototype.connectWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // In a real implementation, detect available wallets and connect
                // For now, we're simulating a successful connection
                try {
                    // Check if window.ethereum exists
                    // const ethereum = window.ethereum;
                    // if (!ethereum) {
                    //   throw new Error('No Ethereum wallet found. Please install MetaMask or Trust Wallet.');
                    // }
                    // const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                    // this.connectedWallet = ethereum;
                    // Check if we need to switch to BNB Chain
                    // const currentChainId = await ethereum.request({ method: 'eth_chainId' });
                    // if (parseInt(currentChainId, 16) !== this.chainId) {
                    //   try {
                    //     // Try to switch to BNB Chain
                    //     await ethereum.request({
                    //       method: 'wallet_switchEthereumChain',
                    //       params: [{ chainId: `0x${this.chainId.toString(16)}` }],
                    //     });
                    //   } catch (switchError) {
                    //     // If chain hasn't been added, suggest adding it
                    //     await ethereum.request({
                    //       method: 'wallet_addEthereumChain',
                    //       params: [{
                    //         chainId: `0x${this.chainId.toString(16)}`,
                    //         chainName: 'BNB Smart Chain',
                    //         nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                    //         rpcUrls: ['https://bsc-dataseed.binance.org/'],
                    //         blockExplorerUrls: ['https://bscscan.com'],
                    //       }],
                    //     });
                    //   }
                    // }
                    // return accounts[0];
                    // Mock implementation for demo
                    this.connectedWallet = {
                        connect: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ['0xYourBNBAddressHere1234567890']];
                        }); }); },
                        disconnect: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); },
                        request: function (args) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (args.method === 'eth_sendTransaction') {
                                    return [2 /*return*/, '0xMockTransactionHash'];
                                }
                                return [2 /*return*/, null];
                            });
                        }); },
                        selectedAddress: '0xYourBNBAddressHere1234567890',
                        chainId: '0x38', // BNB Chain (56 in hex)
                        isConnected: true
                    };
                    return [2 /*return*/, this.connectedWallet.selectedAddress || ''];
                }
                catch (error) {
                    console.error('Failed to connect wallet:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Use the NexWallet's connected wallet instead of a direct connection
     * @param walletAddress The connected wallet address
     */
    BNBChainPlugin.prototype.setExternalWallet = function (walletAddress) {
        var _this = this;
        this.connectedWallet = {
            connect: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, [walletAddress]];
            }); }); },
            disconnect: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); }); },
            request: function (args) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (args.method === 'eth_sendTransaction') {
                        // In a real implementation, this would forward the request to the frontend_agent
                        // to handle the transaction with the connected wallet
                        console.log('Transaction request received:', args);
                        return [2 /*return*/, '0xTransactionFromExternalWallet'];
                    }
                    return [2 /*return*/, null];
                });
            }); },
            selectedAddress: walletAddress,
            chainId: '0x38', // BNB Chain (56 in hex)
            isConnected: true
        };
        console.log("Using external wallet: ".concat(walletAddress));
    };
    /**
     * Disconnect the currently connected wallet
     */
    BNBChainPlugin.prototype.disconnectWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connectedWallet) return [3 /*break*/, 2];
                        // Most wallets don't have a standard disconnect method
                        // Usually, it's handled by the wallet UI
                        return [4 /*yield*/, this.connectedWallet.disconnect()];
                    case 1:
                        // Most wallets don't have a standard disconnect method
                        // Usually, it's handled by the wallet UI
                        _a.sent();
                        this.connectedWallet = null;
                        console.log('Wallet disconnected');
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get BNB account balance
     * @param address The wallet address
     */
    BNBChainPlugin.prototype.getBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isConnected) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        try {
                            // Mock implementation - in a real plugin, this would call the actual RPC
                            // const response = await axios.post(this.rpcUrl, {
                            //   jsonrpc: '2.0',
                            //   id: 1,
                            //   method: 'eth_getBalance',
                            //   params: [address, 'latest']
                            // });
                            // const balanceInWei = parseInt(response.data.result, 16);
                            // return (balanceInWei / 1e18).toString(); // Convert from wei to BNB
                            // Return mock balance
                            return [2 /*return*/, '10.5'];
                        }
                        catch (error) {
                            console.error("Error fetching balance for ".concat(address, ":"), error);
                            throw error;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get BNB token information
     * @param tokenAddress The token contract address
     */
    BNBChainPlugin.prototype.getTokenInfo = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isConnected) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        try {
                            // Mock implementation - in a real plugin, this would call the actual contract
                            return [2 /*return*/, {
                                    name: 'Example Token',
                                    symbol: 'EXT',
                                    decimals: 18,
                                    totalSupply: '1000000000000000000000000',
                                    address: tokenAddress
                                }];
                        }
                        catch (error) {
                            console.error("Error fetching token info for ".concat(tokenAddress, ":"), error);
                            throw error;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get transaction by hash
     * @param txHash The transaction hash
     */
    BNBChainPlugin.prototype.getTransaction = function (txHash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isConnected) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        try {
                            // Mock implementation - in a real plugin, this would call the actual RPC
                            return [2 /*return*/, {
                                    hash: txHash,
                                    blockNumber: '12345678',
                                    from: '0x1234567890123456789012345678901234567890',
                                    to: '0x0987654321098765432109876543210987654321',
                                    value: '1000000000000000000', // 1 BNB
                                    gas: '21000',
                                    gasPrice: '5000000000',
                                    status: 'confirmed'
                                }];
                        }
                        catch (error) {
                            console.error("Error fetching transaction ".concat(txHash, ":"), error);
                            throw error;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send a transaction using the connected wallet
     * @param txData Transaction data (to, value, data)
     */
    BNBChainPlugin.prototype.sendTransaction = function (txData) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionParams, txHash, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connectedWallet) {
                            throw new Error('No wallet connected. Please connect a wallet first using "/bnb connect".');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        transactionParams = {
                            from: this.connectedWallet.selectedAddress,
                            to: txData.to,
                            value: txData.value ? "0x".concat(parseInt(txData.value).toString(16)) : '0x0',
                            data: txData.data || '0x',
                            chainId: this.chainId
                        };
                        return [4 /*yield*/, this.connectedWallet.request({
                                method: 'eth_sendTransaction',
                                params: [transactionParams]
                            })];
                    case 2:
                        txHash = _a.sent();
                        return [2 /*return*/, txHash];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error sending transaction:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Pre-process user message
     * @param message User message
     * @param character Character name
     */
    BNBChainPlugin.prototype.preProcessMessage = function (message, character) {
        return __awaiter(this, void 0, void 0, function () {
            var bnbCommandRegex, match, command, params, _a, address, balance_1, balance, tokenInfo, txInfo, txParts, txData, txHash, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        bnbCommandRegex = /^\/bnb\s+(balance|token|tx|connect|disconnect|send|use)\s*(.*)$/i;
                        match = message.match(bnbCommandRegex);
                        if (!match) return [3 /*break*/, 21];
                        command = match[1].toLowerCase();
                        params = match[2].trim();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 20, , 21]);
                        _a = command;
                        switch (_a) {
                            case 'connect': return [3 /*break*/, 2];
                            case 'disconnect': return [3 /*break*/, 4];
                            case 'use': return [3 /*break*/, 6];
                            case 'balance': return [3 /*break*/, 7];
                            case 'token': return [3 /*break*/, 12];
                            case 'tx': return [3 /*break*/, 14];
                            case 'send': return [3 /*break*/, 16];
                        }
                        return [3 /*break*/, 18];
                    case 2: return [4 /*yield*/, this.connectWallet()];
                    case 3:
                        address = _b.sent();
                        return [2 /*return*/, "Connected to BNB Chain wallet: ".concat(address)];
                    case 4: 
                    // Disconnect wallet
                    return [4 /*yield*/, this.disconnectWallet()];
                    case 5:
                        // Disconnect wallet
                        _b.sent();
                        return [2 /*return*/, 'Disconnected from BNB Chain wallet'];
                    case 6:
                        // Use an externally connected wallet (NexWallet)
                        if (!params)
                            return [2 /*return*/, 'Please provide a wallet address'];
                        this.setExternalWallet(params);
                        return [2 /*return*/, "Using NexWallet wallet: ".concat(params)];
                    case 7:
                        if (!!params) return [3 /*break*/, 10];
                        if (!(this.connectedWallet && this.connectedWallet.selectedAddress)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.getBalance(this.connectedWallet.selectedAddress)];
                    case 8:
                        balance_1 = _b.sent();
                        return [2 /*return*/, "Your BNB balance is: ".concat(balance_1, " BNB")];
                    case 9: return [2 /*return*/, 'Please provide a wallet address or connect a wallet first'];
                    case 10: return [4 /*yield*/, this.getBalance(params)];
                    case 11:
                        balance = _b.sent();
                        return [2 /*return*/, "The BNB balance for address ".concat(params, " is: ").concat(balance, " BNB")];
                    case 12:
                        // Get token info
                        if (!params)
                            return [2 /*return*/, 'Please provide a token address'];
                        return [4 /*yield*/, this.getTokenInfo(params)];
                    case 13:
                        tokenInfo = _b.sent();
                        return [2 /*return*/, "Token information for ".concat(params, ":\n```json\n").concat(JSON.stringify(tokenInfo, null, 2), "\n```")];
                    case 14:
                        // Get transaction details
                        if (!params)
                            return [2 /*return*/, 'Please provide a transaction hash'];
                        return [4 /*yield*/, this.getTransaction(params)];
                    case 15:
                        txInfo = _b.sent();
                        return [2 /*return*/, "Transaction details for ".concat(params, ":\n```json\n").concat(JSON.stringify(txInfo, null, 2), "\n```")];
                    case 16:
                        // Send a transaction
                        if (!params)
                            return [2 /*return*/, 'Please provide transaction details in format: to_address,value_in_bnb,data(optional)'];
                        txParts = params.split(',');
                        if (txParts.length < 2) {
                            return [2 /*return*/, 'Invalid transaction format. Use: to_address,value_in_bnb,data(optional)'];
                        }
                        txData = {
                            to: txParts[0].trim(),
                            value: (parseFloat(txParts[1].trim()) * 1e18).toString() // Convert BNB to wei
                        };
                        if (txParts.length > 2) {
                            txData.data = txParts[2].trim();
                        }
                        return [4 /*yield*/, this.sendTransaction(txData)];
                    case 17:
                        txHash = _b.sent();
                        return [2 /*return*/, "Transaction sent successfully! Transaction hash: ".concat(txHash)];
                    case 18: return [2 /*return*/, "Unknown BNB Chain command: ".concat(command)];
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        error_3 = _b.sent();
                        return [2 /*return*/, "Error processing BNB Chain command: ".concat(error_3 instanceof Error ? error_3.message : String(error_3))];
                    case 21: 
                    // If it's not a BNB command, return the original message
                    return [2 /*return*/, message];
                }
            });
        });
    };
    /**
     * Post-process response from the model
     * @param response Model response
     * @param character Character name
     */
    BNBChainPlugin.prototype.postProcessResponse = function (response, character) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // For this plugin, we don't modify the response
                return [2 /*return*/, response];
            });
        });
    };
    /**
     * Clean up resources
     */
    BNBChainPlugin.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connectedWallet) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.disconnectWallet()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.isConnected = false;
                        console.log('BNB Chain plugin cleaned up');
                        return [2 /*return*/];
                }
            });
        });
    };
    return BNBChainPlugin;
}());
exports.BNBChainPlugin = BNBChainPlugin;
exports.default = BNBChainPlugin;
