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
exports.ElizaService = void 0;
var child_process_1 = require("child_process");
var path_1 = require("path");
var fs_1 = require("fs");
var axios_1 = require("axios");
var PluginManager_1 = require("./plugins/PluginManager");
var ElizaService = /** @class */ (function () {
    function ElizaService() {
        this.elizaProcess = null;
        this.characters = new Map();
        this.isRunning = false;
        // OpenAI API key from environment variable
        this.openaiApiKey = process.env.OPENAI_API_KEY;
        // Load config
        var configPath = path_1.default.join(process.cwd(), 'eliza', 'config.json');
        this.config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
        this.baseUrl = "http://".concat(this.config.runtime.host, ":").concat(this.config.runtime.port);
        // Initialize plugin manager
        this.pluginManager = new PluginManager_1.PluginManager(this);
        // Load characters
        this.loadCharacters();
    }
    ElizaService.prototype.loadPlugins = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.config.plugins && Array.isArray(this.config.plugins))) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.pluginManager.loadPlugins(this.config.plugins)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ElizaService.prototype.loadCharacters = function () {
        var _this = this;
        var charactersDir = path_1.default.join(process.cwd(), 'eliza', 'characters');
        var files = fs_1.default.readdirSync(charactersDir);
        files.forEach(function (file) {
            if (file.endsWith('.character.json')) {
                var characterPath = path_1.default.join(charactersDir, file);
                var character = JSON.parse(fs_1.default.readFileSync(characterPath, 'utf8'));
                _this.characters.set(character.name.toLowerCase(), character);
            }
        });
    };
    ElizaService.prototype.startEliza = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.isRunning) {
                    console.log('Eliza is already running');
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, new Promise(function (resolve) {
                        var _a, _b;
                        try {
                            _this.elizaProcess = (0, child_process_1.spawn)('npx', ['elizaos', 'start', '--config=./eliza/config.json'], {
                                cwd: process.cwd(),
                                stdio: ['ignore', 'pipe', 'pipe'],
                            });
                            var output_1 = '';
                            (_a = _this.elizaProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
                                output_1 += data.toString();
                                console.log("Eliza stdout: ".concat(data));
                                if (output_1.includes('Server running at')) {
                                    _this.isRunning = true;
                                    // Load plugins after Eliza is started
                                    _this.loadPlugins().then(function () {
                                        resolve(true);
                                    });
                                }
                            });
                            (_b = _this.elizaProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
                                console.error("Eliza stderr: ".concat(data));
                            });
                            _this.elizaProcess.on('close', function (code) {
                                console.log("Eliza process exited with code ".concat(code));
                                _this.isRunning = false;
                            });
                            // After 5 seconds, assume it's started
                            setTimeout(function () {
                                if (!_this.isRunning) {
                                    _this.isRunning = true;
                                    resolve(true);
                                }
                            }, 5000);
                        }
                        catch (error) {
                            console.error('Failed to start Eliza:', error);
                            resolve(false);
                        }
                    })];
            });
        });
    };
    ElizaService.prototype.stopEliza = function () {
        return __awaiter(this, void 0, void 0, function () {
            var plugins, _i, plugins_1, plugin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plugins = this.pluginManager.getPlugins();
                        _i = 0, plugins_1 = plugins;
                        _a.label = 1;
                    case 1:
                        if (!(_i < plugins_1.length)) return [3 /*break*/, 4];
                        plugin = plugins_1[_i];
                        if (!plugin.cleanup) return [3 /*break*/, 3];
                        return [4 /*yield*/, plugin.cleanup()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (this.elizaProcess) {
                            this.elizaProcess.kill();
                            this.elizaProcess = null;
                            this.isRunning = false;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ElizaService.prototype.getCharacters = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.characters.keys())];
            });
        });
    };
    ElizaService.prototype.sendMessage = function (message, character) {
        return __awaiter(this, void 0, void 0, function () {
            var characterLower, processedMessage, response, processedResponse, error_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        characterLower = character.toLowerCase();
                        // Check if the character exists
                        if (!this.characters.has(characterLower)) {
                            throw new Error("Character '".concat(character, "' not found"));
                        }
                        return [4 /*yield*/, this.pluginManager.preProcessMessage(message, characterLower)];
                    case 1:
                        processedMessage = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 10]);
                        if (!this.isRunning) return [3 /*break*/, 5];
                        return [4 /*yield*/, axios_1.default.post("".concat(this.baseUrl, "/api/message"), {
                                message: processedMessage,
                                character: characterLower
                            })];
                    case 3:
                        response = _a.sent();
                        return [4 /*yield*/, this.pluginManager.postProcessResponse(response.data.response, characterLower)];
                    case 4:
                        processedResponse = _a.sent();
                        return [2 /*return*/, processedResponse];
                    case 5: return [4 /*yield*/, this.directModelCall(processedMessage, characterLower)];
                    case 6: 
                    // Fallback to direct OpenAI call
                    return [2 /*return*/, _a.sent()];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        error_1 = _a.sent();
                        console.error('Error using Eliza API, falling back to direct API call:', error_1);
                        return [4 /*yield*/, this.directModelCall(processedMessage, characterLower)];
                    case 9: return [2 /*return*/, _a.sent()];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_2 = _a.sent();
                        console.error('Error sending message to Eliza:', error_2);
                        throw error_2;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    ElizaService.prototype.rephraseWithCharacter = function (text, character) {
        return __awaiter(this, void 0, void 0, function () {
            var characterLower, processedText, characterConfig, prompt_1, response, processedResponse, error_3, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        characterLower = character.toLowerCase();
                        // Check if the character exists
                        if (!this.characters.has(characterLower)) {
                            throw new Error("Character '".concat(character, "' not found"));
                        }
                        return [4 /*yield*/, this.pluginManager.preProcessMessage(text, characterLower)];
                    case 1:
                        processedText = _a.sent();
                        characterConfig = this.characters.get(characterLower);
                        if (!characterConfig) {
                            throw new Error("Character '".concat(character, "' configuration not found"));
                        }
                        prompt_1 = "Please rephrase the following text in your unique style. Maintain the same meaning but express it as if you were speaking:\n\n\"".concat(processedText, "\"");
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.directModelCall(prompt_1, characterLower)];
                    case 3:
                        response = _a.sent();
                        return [4 /*yield*/, this.pluginManager.postProcessResponse(response, characterLower)];
                    case 4:
                        processedResponse = _a.sent();
                        return [2 /*return*/, processedResponse];
                    case 5:
                        error_3 = _a.sent();
                        console.error('Error rephrasing with direct API call:', error_3);
                        throw error_3;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_4 = _a.sent();
                        console.error('Error rephrasing with Eliza character:', error_4);
                        throw error_4;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // Helper method to get plugin manager
    ElizaService.prototype.getPluginManager = function () {
        return this.pluginManager;
    };
    // Direct model call using OpenAI API
    ElizaService.prototype.directModelCall = function (message, character) {
        return __awaiter(this, void 0, void 0, function () {
            var characterConfig, response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.openaiApiKey) {
                            throw new Error('OpenAI API key is not configured. Set the OPENAI_API_KEY environment variable.');
                        }
                        characterConfig = this.characters.get(character);
                        if (!characterConfig) {
                            throw new Error("Character '".concat(character, "' configuration not found"));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                                model: characterConfig.configuration.modelName || 'gpt-4',
                                messages: [
                                    { role: 'system', content: characterConfig.system_prompt },
                                    { role: 'user', content: message }
                                ],
                                temperature: characterConfig.configuration.temperature || 0.7,
                                max_tokens: characterConfig.configuration.max_tokens || 800
                            }, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(this.openaiApiKey)
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data.choices[0].message.content];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Error calling OpenAI API:', error_5);
                        throw new Error("Failed to generate response: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ElizaService;
}());
exports.ElizaService = ElizaService;
