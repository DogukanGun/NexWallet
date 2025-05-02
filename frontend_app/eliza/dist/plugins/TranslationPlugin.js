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
exports.TranslationPlugin = void 0;
/**
 * A simple translation plugin for Eliza
 * Demonstrates how to perform text transformations
 */
var TranslationPlugin = /** @class */ (function () {
    function TranslationPlugin() {
        this.id = 'translation-plugin';
        this.name = 'Translation Plugin';
        this.version = '1.0.0';
        this.description = 'Adds translation capabilities to Eliza responses';
        this.elizaService = null;
        this.activeLanguage = 'english'; // Default language
        this.languageCode = 'en'; // Default language code
        this.languageMap = {
            'english': 'en',
            'spanish': 'es',
            'french': 'fr',
            'german': 'de',
            'italian': 'it',
            'portuguese': 'pt',
            'russian': 'ru',
            'japanese': 'ja',
            'chinese': 'zh',
            'korean': 'ko',
            'arabic': 'ar',
            'turkish': 'tr'
        };
    }
    /**
     * Initialize the plugin
     * @param elizaService The Eliza service
     */
    TranslationPlugin.prototype.initialize = function (elizaService) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.elizaService = elizaService;
                console.log('Translation plugin initialized');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Set the active language for translation
     * @param language The language to translate to
     */
    TranslationPlugin.prototype.setLanguage = function (language) {
        var lowerLanguage = language.toLowerCase();
        if (this.languageMap[lowerLanguage]) {
            this.activeLanguage = lowerLanguage;
            this.languageCode = this.languageMap[lowerLanguage];
            console.log("Translation language set to: ".concat(lowerLanguage, " (").concat(this.languageCode, ")"));
            return true;
        }
        return false;
    };
    /**
     * Get available languages
     */
    TranslationPlugin.prototype.getAvailableLanguages = function () {
        return Object.keys(this.languageMap);
    };
    /**
     * Simple mock translation function
     * In a real plugin, this would call an actual translation API
     * @param text Text to translate
     * @param targetLanguage Target language code
     */
    TranslationPlugin.prototype.translateText = function (text, targetLanguage) {
        return __awaiter(this, void 0, void 0, function () {
            var languageName;
            var _this = this;
            return __generator(this, function (_a) {
                // This is a mock implementation
                // In a real plugin, you would call a translation API
                if (targetLanguage === 'en') {
                    // If target is English, return the original
                    return [2 /*return*/, text];
                }
                languageName = Object.keys(this.languageMap).find(function (lang) { return _this.languageMap[lang] === targetLanguage; }) || targetLanguage;
                return [2 /*return*/, "[Translated to ".concat(languageName, "]: ").concat(text)];
            });
        });
    };
    /**
     * Pre-process user message
     * @param message User message
     * @param character Character name
     */
    TranslationPlugin.prototype.preProcessMessage = function (message, character) {
        return __awaiter(this, void 0, void 0, function () {
            var languageRegex, match, requestedLanguage, success;
            return __generator(this, function (_a) {
                languageRegex = /^\/translate\s+to\s+([a-z]+)$/i;
                match = message.match(languageRegex);
                if (match) {
                    requestedLanguage = match[1].toLowerCase();
                    success = this.setLanguage(requestedLanguage);
                    // Return a placeholder message that will be replaced by Eliza
                    if (success) {
                        return [2 /*return*/, "I'll now respond in ".concat(requestedLanguage, ".")];
                    }
                    else {
                        return [2 /*return*/, "Sorry, I don't support translation to ".concat(requestedLanguage, ". Available languages: ").concat(this.getAvailableLanguages().join(', '))];
                    }
                }
                // If it's not a language command, return the original message
                return [2 /*return*/, message];
            });
        });
    };
    /**
     * Post-process response from the model
     * @param response Model response
     * @param character Character name
     */
    TranslationPlugin.prototype.postProcessResponse = function (response, character) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.languageCode !== 'en')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.translateText(response, this.languageCode)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, response];
                }
            });
        });
    };
    /**
     * Clean up resources
     */
    TranslationPlugin.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Translation plugin cleaned up');
                return [2 /*return*/];
            });
        });
    };
    return TranslationPlugin;
}());
exports.TranslationPlugin = TranslationPlugin;
exports.default = TranslationPlugin;
