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
exports.SentimentPlugin = void 0;
/**
 * A simple sentiment analysis plugin for Eliza
 * Adds sentiment information to messages
 */
var SentimentPlugin = /** @class */ (function () {
    function SentimentPlugin() {
        this.id = 'sentiment-plugin';
        this.name = 'Sentiment Analysis';
        this.version = '1.0.0';
        this.description = 'Analyzes sentiment in messages and adds emoji indicators';
        this.elizaService = null;
        this.sentimentEmojis = {
            positive: '😊',
            neutral: '😐',
            negative: '😔'
        };
    }
    /**
     * Initialize the plugin
     * @param elizaService The Eliza service
     */
    SentimentPlugin.prototype.initialize = function (elizaService) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.elizaService = elizaService;
                console.log('Sentiment Analysis plugin initialized');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Simple sentiment analysis function
     * @param text Text to analyze
     * @returns Sentiment score (-1 to 1)
     */
    SentimentPlugin.prototype.analyzeSentiment = function (text) {
        var positiveWords = [
            'happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'like',
            'enjoy', 'pleased', 'excited', 'fantastic', 'delighted', 'glad', 'thrilled'
        ];
        var negativeWords = [
            'sad', 'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'upset',
            'angry', 'disappointed', 'frustrating', 'annoying', 'miserable', 'unhappy'
        ];
        var words = text.toLowerCase().split(/\W+/);
        var score = 0;
        for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
            var word = words_1[_i];
            if (positiveWords.includes(word)) {
                score += 1;
            }
            else if (negativeWords.includes(word)) {
                score -= 1;
            }
        }
        // Normalize score to range between -1 and 1
        return score === 0 ? 0 : score / Math.max(1, Math.abs(score));
    };
    /**
     * Get sentiment emoji based on score
     * @param score Sentiment score (-1 to 1)
     */
    SentimentPlugin.prototype.getSentimentEmoji = function (score) {
        if (score > 0.2) {
            return this.sentimentEmojis.positive;
        }
        else if (score < -0.2) {
            return this.sentimentEmojis.negative;
        }
        else {
            return this.sentimentEmojis.neutral;
        }
    };
    /**
     * Pre-process user message
     * @param message User message
     * @param character Character name
     */
    SentimentPlugin.prototype.preProcessMessage = function (message, character) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // We don't modify user messages in this plugin
                return [2 /*return*/, message];
            });
        });
    };
    /**
     * Post-process response from the model
     * @param response Model response
     * @param character Character name
     */
    SentimentPlugin.prototype.postProcessResponse = function (response, character) {
        return __awaiter(this, void 0, void 0, function () {
            var sentimentScore, sentimentEmoji;
            return __generator(this, function (_a) {
                sentimentScore = this.analyzeSentiment(response);
                sentimentEmoji = this.getSentimentEmoji(sentimentScore);
                // Add sentiment emoji to the beginning of the response
                return [2 /*return*/, "".concat(sentimentEmoji, " ").concat(response)];
            });
        });
    };
    /**
     * Clean up resources
     */
    SentimentPlugin.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Sentiment Analysis plugin cleaned up');
                return [2 /*return*/];
            });
        });
    };
    return SentimentPlugin;
}());
exports.SentimentPlugin = SentimentPlugin;
exports.default = SentimentPlugin;
