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
exports.SonicSVMPlugin = void 0;
/**
 * Sonic SVM Plugin for Eliza
 * Integrates with the high-performance Solana Virtual Machine implementation
 */
var SonicSVMPlugin = /** @class */ (function () {
    function SonicSVMPlugin() {
        this.id = 'sonic-svm-plugin';
        this.name = 'Sonic SVM';
        this.version = '1.0.0';
        this.description = 'Integrates with Sonic SVM - high-performance Solana Virtual Machine implementation';
        this.elizaService = null;
        this.apiBaseUrl = 'https://api.sonicsvm.example'; // Replace with actual API URL
        this.isConnected = false;
        this.connectedWallet = null;
    }
    /**
     * Initialize the plugin
     * @param elizaService The Eliza service
     */
    SonicSVMPlugin.prototype.initialize = function (elizaService) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.elizaService = elizaService;
                        console.log('Sonic SVM plugin initialized');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.connect()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to connect to Sonic SVM API:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Connect to the Sonic SVM API
     */
    SonicSVMPlugin.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // In a real implementation, this would connect to the actual Sonic SVM API
                    // For demo purposes, we're just simulating success
                    // const response = await axios.get(`${this.apiBaseUrl}/status`);
                    // this.isConnected = response.data.status === 'ok';
                    this.isConnected = true;
                    console.log('Connected to Sonic SVM');
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
     * Connect to a wallet (Phantom, Solflare, etc.)
     * @returns The wallet's public key
     */
    SonicSVMPlugin.prototype.connectWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // In a real implementation, detect available wallets and connect
                // For now, we're simulating a successful connection
                try {
                    // Check if window.solana (Phantom) or window.solflare exists
                    // const wallet = window.solana || window.solflare || null;
                    // if (!wallet) {
                    //   throw new Error('No Solana wallet found. Please install Phantom or Solflare.');
                    // }
                    // await wallet.connect();
                    // this.connectedWallet = wallet;
                    // return wallet.publicKey.toString();
                    // Mock implementation for demo
                    this.connectedWallet = {
                        connect: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, '5YourSolanaPublicKeyHere1234567890'];
                        }); }); },
                        disconnect: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); },
                        signTransaction: function (tx) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, tx];
                        }); }); },
                        signAllTransactions: function (txs) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, txs];
                        }); }); },
                        signMessage: function (msg) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ signature: new Uint8Array([1, 2, 3]) })];
                        }); }); },
                        publicKey: '5YourSolanaPublicKeyHere1234567890'
                    };
                    return [2 /*return*/, this.connectedWallet.publicKey || ''];
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
     * Use NexWallet's connected wallet instead of a direct connection
     * @param walletPublicKey The public key of the connected Solana wallet in NexWallet
     */
    SonicSVMPlugin.prototype.setExternalWallet = function (walletPublicKey) {
        var _this = this;
        // Create a wrapper for the NexWallet's wallet
        this.connectedWallet = {
            connect: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, walletPublicKey];
            }); }); },
            disconnect: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); }); },
            signTransaction: function (tx) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // In a real implementation, this would forward the transaction to NexWallet's
                    // frontend agent to handle the signing with the connected wallet
                    console.log('Transaction signing request received:', tx);
                    return [2 /*return*/, tx]; // Return as if signed
                });
            }); },
            signAllTransactions: function (txs) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Same as above but for multiple transactions
                    console.log('Multiple transactions signing request received:', txs);
                    return [2 /*return*/, txs]; // Return as if signed
                });
            }); },
            signMessage: function (msg) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Forward message signing to NexWallet
                    console.log('Message signing request received:', msg);
                    return [2 /*return*/, { signature: new Uint8Array([1, 2, 3]) }]; // Mock signature
                });
            }); },
            publicKey: walletPublicKey
        };
        console.log("Using NexWallet's Solana wallet: ".concat(walletPublicKey));
    };
    /**
     * Disconnect the currently connected wallet
     */
    SonicSVMPlugin.prototype.disconnectWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connectedWallet) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connectedWallet.disconnect()];
                    case 1:
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
     * Get Solana account information
     * @param accountAddress The Solana account address
     */
    SonicSVMPlugin.prototype.getAccountInfo = function (accountAddress) {
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
                            // Mock implementation - in a real plugin, this would call the actual API
                            // const response = await axios.get(`${this.apiBaseUrl}/account/${accountAddress}`);
                            // return response.data;
                            return [2 /*return*/, {
                                    address: accountAddress,
                                    balance: '1000000000',
                                    executable: false,
                                    owner: 'System Program',
                                    rentEpoch: 0,
                                    data: 'Base64 encoded data would be here'
                                }];
                        }
                        catch (error) {
                            console.error("Error fetching account ".concat(accountAddress, ":"), error);
                            throw error;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Simulate a Solana transaction
     * @param transaction The encoded transaction
     */
    SonicSVMPlugin.prototype.simulateTransaction = function (transaction) {
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
                            // Mock implementation - in a real plugin, this would call the actual API
                            // const response = await axios.post(`${this.apiBaseUrl}/simulate`, { transaction });
                            // return response.data;
                            return [2 /*return*/, {
                                    success: true,
                                    logs: [
                                        'Program log: Instruction: Simulate',
                                        'Program log: Success'
                                    ],
                                    unitsConsumed: 1500
                                }];
                        }
                        catch (error) {
                            console.error('Error simulating transaction:', error);
                            throw error;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send a transaction (requires wallet connection)
     * @param serializedTransaction The serialized transaction
     */
    SonicSVMPlugin.prototype.sendTransaction = function (serializedTransaction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.connectedWallet) {
                    throw new Error('No wallet connected. Please connect a wallet first using "/solana connect".');
                }
                try {
                    // In a real implementation:
                    // 1. Deserialize the transaction
                    // 2. Have the wallet sign it
                    // 3. Send it to the network
                    // const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'));
                    // const signedTransaction = await this.connectedWallet.signTransaction(transaction);
                    // const signature = await connection.sendRawTransaction(signedTransaction.serialize());
                    // await connection.confirmTransaction(signature);
                    // Mock implementation
                    return [2 /*return*/, 'SimulatedTransactionHashXYZ123'];
                }
                catch (error) {
                    console.error('Error sending transaction:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Pre-process user message
     * @param message User message
     * @param character Character name
     */
    SonicSVMPlugin.prototype.preProcessMessage = function (message, character) {
        return __awaiter(this, void 0, void 0, function () {
            var sonicCommandRegex, match, command, params, _a, publicKey, accountInfo, result, txHash, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sonicCommandRegex = /^\/solana\s+(account|simulate|connect|disconnect|send|use)\s*(.*)$/i;
                        match = message.match(sonicCommandRegex);
                        if (!match) return [3 /*break*/, 16];
                        command = match[1].toLowerCase();
                        params = match[2].trim();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 15, , 16]);
                        _a = command;
                        switch (_a) {
                            case 'connect': return [3 /*break*/, 2];
                            case 'disconnect': return [3 /*break*/, 4];
                            case 'use': return [3 /*break*/, 6];
                            case 'account': return [3 /*break*/, 7];
                            case 'simulate': return [3 /*break*/, 9];
                            case 'send': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 2: return [4 /*yield*/, this.connectWallet()];
                    case 3:
                        publicKey = _b.sent();
                        return [2 /*return*/, "Connected to Solana wallet: ".concat(publicKey)];
                    case 4: 
                    // Disconnect wallet
                    return [4 /*yield*/, this.disconnectWallet()];
                    case 5:
                        // Disconnect wallet
                        _b.sent();
                        return [2 /*return*/, 'Disconnected from Solana wallet'];
                    case 6:
                        // Use NexWallet's connected wallet
                        if (!params)
                            return [2 /*return*/, 'Please provide a wallet public key'];
                        this.setExternalWallet(params);
                        return [2 /*return*/, "Using NexWallet's Solana wallet: ".concat(params)];
                    case 7:
                        // Fetch account info
                        if (!params)
                            return [2 /*return*/, 'Please provide an account address'];
                        return [4 /*yield*/, this.getAccountInfo(params)];
                    case 8:
                        accountInfo = _b.sent();
                        return [2 /*return*/, "Here's the account information for ".concat(params, ":\n```json\n").concat(JSON.stringify(accountInfo, null, 2), "\n```")];
                    case 9:
                        // Simulate transaction
                        if (!params)
                            return [2 /*return*/, 'Please provide transaction data'];
                        return [4 /*yield*/, this.simulateTransaction(params)];
                    case 10:
                        result = _b.sent();
                        return [2 /*return*/, "Transaction simulation result:\n```json\n".concat(JSON.stringify(result, null, 2), "\n```")];
                    case 11:
                        // Send transaction
                        if (!params)
                            return [2 /*return*/, 'Please provide transaction data'];
                        return [4 /*yield*/, this.sendTransaction(params)];
                    case 12:
                        txHash = _b.sent();
                        return [2 /*return*/, "Transaction sent successfully! Transaction hash: ".concat(txHash)];
                    case 13: return [2 /*return*/, "Unknown Solana command: ".concat(command)];
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        error_2 = _b.sent();
                        return [2 /*return*/, "Error processing Solana command: ".concat(error_2 instanceof Error ? error_2.message : String(error_2))];
                    case 16: 
                    // If it's not a Solana command, return the original message
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
    SonicSVMPlugin.prototype.postProcessResponse = function (response, character) {
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
    SonicSVMPlugin.prototype.cleanup = function () {
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
                        console.log('Sonic SVM plugin cleaned up');
                        return [2 /*return*/];
                }
            });
        });
    };
    return SonicSVMPlugin;
}());
exports.SonicSVMPlugin = SonicSVMPlugin;
exports.default = SonicSVMPlugin;
