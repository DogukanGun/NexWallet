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
exports.PluginManager = void 0;
var path_1 = require("path");
var fs_1 = require("fs");
var PluginManager = /** @class */ (function () {
    function PluginManager(elizaService) {
        this.plugins = [];
        this.elizaService = elizaService;
    }
    /**
     * Load multiple plugins from the config
     * @param pluginPaths Array of plugin paths
     */
    PluginManager.prototype.loadPlugins = function (pluginPaths) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, pluginPaths_1, pluginPath, pluginModule, localPluginPath, distPluginPath, PluginClass, plugin, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, pluginPaths_1 = pluginPaths;
                        _a.label = 1;
                    case 1:
                        if (!(_i < pluginPaths_1.length)) return [3 /*break*/, 6];
                        pluginPath = pluginPaths_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        pluginModule = void 0;
                        // If the plugin path is just a name, look for it in the plugins directory
                        if (!pluginPath.includes('/') && !pluginPath.includes('\\')) {
                            localPluginPath = path_1.default.join(__dirname, "".concat(pluginPath, ".ts"));
                            distPluginPath = path_1.default.join(__dirname, "".concat(pluginPath, ".js"));
                            if (fs_1.default.existsSync(localPluginPath)) {
                                pluginModule = require(localPluginPath);
                            }
                            else if (fs_1.default.existsSync(distPluginPath)) {
                                pluginModule = require(distPluginPath);
                            }
                            else {
                                console.error("Plugin not found: ".concat(pluginPath));
                                return [3 /*break*/, 5];
                            }
                        }
                        else {
                            pluginModule = require(pluginPath);
                        }
                        PluginClass = pluginModule.default || pluginModule;
                        plugin = new PluginClass();
                        // Make sure the plugin implements the ElizaPlugin interface
                        if (!this.isElizaPlugin(plugin)) {
                            console.error("".concat(pluginPath, " does not implement the ElizaPlugin interface"));
                            return [3 /*break*/, 5];
                        }
                        // Initialize the plugin
                        return [4 /*yield*/, plugin.initialize(this.elizaService)];
                    case 3:
                        // Initialize the plugin
                        _a.sent();
                        this.plugins.push(plugin);
                        console.log("Loaded plugin: ".concat(plugin.name, " v").concat(plugin.version));
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error loading plugin ".concat(pluginPath, ":"), error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Unload a plugin by its ID
     * @param pluginId The plugin ID
     */
    PluginManager.prototype.unloadPlugin = function (pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            var plugin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plugin = this.plugins.find(function (p) { return p.id === pluginId; });
                        if (!plugin) {
                            console.error("Plugin not found: ".concat(pluginId));
                            return [2 /*return*/, false];
                        }
                        if (!plugin.cleanup) return [3 /*break*/, 2];
                        return [4 /*yield*/, plugin.cleanup()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // Remove the plugin
                        this.plugins.splice(this.plugins.indexOf(plugin), 1);
                        console.log("Plugin unloaded: ".concat(plugin.name, " (").concat(plugin.id, ")"));
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Get a list of all loaded plugins
     */
    PluginManager.prototype.getPlugins = function () {
        return this.plugins;
    };
    /**
     * Pre-process a message through all plugins
     * @param message The user message
     * @param character The character name
     */
    PluginManager.prototype.preProcessMessage = function (message, character) {
        return __awaiter(this, void 0, void 0, function () {
            var processedMessage, _i, _a, plugin, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        processedMessage = message;
                        _i = 0, _a = this.plugins;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        plugin = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        if (!(typeof plugin.preProcessMessage === 'function')) return [3 /*break*/, 4];
                        return [4 /*yield*/, plugin.preProcessMessage(processedMessage, character)];
                    case 3:
                        processedMessage = _b.sent();
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_2 = _b.sent();
                        console.error("Error in ".concat(plugin.name, ".preProcessMessage:"), error_2);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, processedMessage];
                }
            });
        });
    };
    /**
     * Post-process a response through all plugins
     * @param response The model response
     * @param character The character name
     */
    PluginManager.prototype.postProcessResponse = function (response, character) {
        return __awaiter(this, void 0, void 0, function () {
            var processedResponse, _i, _a, plugin, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        processedResponse = response;
                        _i = 0, _a = this.plugins;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        plugin = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        if (!(typeof plugin.postProcessResponse === 'function')) return [3 /*break*/, 4];
                        return [4 /*yield*/, plugin.postProcessResponse(processedResponse, character)];
                    case 3:
                        processedResponse = _b.sent();
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_3 = _b.sent();
                        console.error("Error in ".concat(plugin.name, ".postProcessResponse:"), error_3);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, processedResponse];
                }
            });
        });
    };
    PluginManager.prototype.isElizaPlugin = function (obj) {
        return (obj &&
            typeof obj.id === 'string' &&
            typeof obj.name === 'string' &&
            typeof obj.version === 'string' &&
            typeof obj.description === 'string' &&
            typeof obj.initialize === 'function' &&
            typeof obj.preProcessMessage === 'function' &&
            typeof obj.postProcessResponse === 'function' &&
            typeof obj.cleanup === 'function');
    };
    return PluginManager;
}());
exports.PluginManager = PluginManager;
