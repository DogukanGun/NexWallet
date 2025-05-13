'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { AuthProvider as AuthContextProvider } from '@/app/context/AuthContext';
import AuthProvider from '../../providers/AuthProvider'
import { apiService } from '@/app/services/ApiService';
import { useTheme } from '@/store/ThemeContext';

export default function VoiceCustomizationPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [voiceFile, setVoiceFile] = useState<File | null>(null);
    const [shareVoice, setShareVoice] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [voiceName, setVoiceName] = useState('');
    const [showStorageInfo, setShowStorageInfo] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVoiceFile(file);
        }
    };

    const handleUpload = async () => {
        if (!voiceFile) {
            alert('Please select a voice file first');
            return;
        }

        if (shareVoice && !voiceName.trim()) {
            alert('Please provide a name for your voice model');
            return;
        }

        // Validate file type
        const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg'];
        if (!validTypes.includes(voiceFile.type)) {
            alert('Please upload a valid WAV or MP3 file.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(10);

        try {
            const response = await apiService.cloneVoice(voiceFile, shareVoice);
            setShowSuccessModal(true);
            
            setVoiceFile(null);
            setShareVoice(false);
            setVoiceName('');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload voice file. Please try again.');
        } finally {
            setUploadProgress(100);
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
            }, 500);
        }
    };

    const handleNavigate = (path: string) => {
        setShowSuccessModal(false);
        router.push(path);
    };

    return (
        <AuthContextProvider>
            <AuthProvider>
                <main className={`min-h-screen ${
                    theme === 'dark'
                        ? 'bg-gradient-to-b from-black to-gray-900 text-white'
                        : 'bg-gradient-to-b from-white to-gray-100 text-gray-900'
                    } page-with-navbar`}>
                    <div className="container mx-auto px-4 py-8">
                        {/* Header Section */}
                        <section className="mb-12">
                            <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Voice <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>Customization</span>
                            </h1>
                            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                Personalize your AI agent with your own voice. Create a more authentic and engaging interaction experience.
                            </p>
                        </section>

                        {/* Enhanced Information Banner */}
                        <section className="mb-12">
                            <div className={`relative overflow-hidden ${
                                theme === 'dark'
                                    ? 'bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 border-purple-500/20'
                                    : 'bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border-purple-200'
                                } rounded-2xl border p-6`}>
                                <div className="relative">
                                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                                        Next-Gen Voice AI Technology
                                    </h2>
                                    <div className={`space-y-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    Basic Voice Cloning
                                                </h3>
                                                <ul className="list-disc list-inside space-y-2 text-sm">
                                                    <li>Create your personal AI voice model</li>
                                                    <li>Secure local storage</li>
                                                    <li>Basic voice customization</li>
                                                    <li>Standard encryption</li>
                                                </ul>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className={`text-lg font-semibold flex items-center`}>
                                                    <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>
                                                        Advanced Decentralized Features
                                                    </span>
                                                    <span className={`ml-2 text-xs ${
                                                        theme === 'dark' 
                                                            ? 'bg-purple-500/20 text-purple-300'
                                                            : 'bg-purple-100 text-purple-600'
                                                        } px-2 py-1 rounded`}>
                                                        Optional
                                                    </span>
                                                </h3>
                                                <ul className="list-disc list-inside space-y-2 text-sm">
                                                    <li>Decentralized storage on Filecoin IPFS</li>
                                                    <li>Contribute to federated learning</li>
                                                    <li>Enhanced voice model quality</li>
                                                    <li>Double-layer encryption protection</li>
                                                </ul>
                                                <button 
                                                    onClick={() => setShowStorageInfo(!showStorageInfo)}
                                                    className={`text-sm hover:text-purple-500 flex items-center ${
                                                        theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                                    }`}
                                                >
                                                    Learn more about decentralized storage
                                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {showStorageInfo && (
                                            <div className={`mt-6 p-6 rounded-xl border ${
                                                theme === 'dark'
                                                    ? 'bg-black/30 border-purple-500/20'
                                                    : 'bg-white border-purple-200'
                                                }`}>
                                                <h4 className={`text-lg font-semibold mb-4 ${
                                                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                                }`}>
                                                    How Decentralized Storage Works
                                                </h4>
                                                <div className="space-y-4">
                                                    <p className="text-sm">
                                                        When you choose to use decentralized storage, your voice model is:
                                                    </p>
                                                    <ol className="list-decimal list-inside space-y-3 text-sm">
                                                        <li><span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>Double Encrypted:</span> First by your personal key, then by our system</li>
                                                        <li><span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>Stored on IPFS:</span> A secure, decentralized storage network powered by Filecoin</li>
                                                        <li><span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>Always Under Your Control:</span> Only you can authorize its use</li>
                                                        <li><span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>Contributes to Learning:</span> Helps improve the AI while maintaining privacy</li>
                                                    </ol>
                                                    <div className={`p-4 rounded-lg mt-4 ${
                                                        theme === 'dark' 
                                                            ? 'bg-purple-500/10'
                                                            : 'bg-purple-50'
                                                    }`}>
                                                        <p className={`text-xs ${
                                                            theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                                                        }`}>
                                                            🔒 Your voice data remains private and encrypted at all times. The federated learning process happens in your browser, 
                                                            ensuring your original voice data never leaves your control.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Upload Section */}
                        <section className="mb-12">
                            <div className={`relative overflow-hidden p-6 ${
                                theme === 'dark'
                                    ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-gray-700'
                                    : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
                                } backdrop-blur-sm rounded-xl border`}>
                                <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Upload Voice Sample
                                </h2>
                                
                                <div className="space-y-6">
                                    <div className={`border-2 border-dashed rounded-xl p-6 text-center ${
                                        theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200'
                                    }`}>
                                        <input
                                            id="voice-upload"
                                            type="file"
                                            accept="audio/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label htmlFor="voice-upload" className="cursor-pointer">
                                            <div className={`mx-auto w-12 h-12 mb-4 rounded-full flex items-center justify-center ${
                                                theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                                            }`}>
                                                <svg className={`w-6 h-6 ${
                                                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                </svg>
                                            </div>
                                            <p className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>
                                                Click to upload or drag and drop
                                            </p>
                                            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                                WAV or MP3 up to 10MB
                                            </p>
                                        </label>
                                    </div>

                                    {voiceFile && (
                                        <div className={`p-4 rounded-lg flex items-center justify-between ${
                                            theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
                                        }`}>
                                            <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>
                                                {voiceFile.name}
                                            </span>
                                            <button
                                                onClick={() => setVoiceFile(null)}
                                                className={`hover:text-red-400 ${
                                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                }`}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}

                                    {isUploading && (
                                        <div className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}>
                                            <div
                                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setShareVoice(false)}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                                    !shareVoice 
                                                        ? `${theme === 'dark' 
                                                            ? 'border-purple-500 bg-purple-500/10'
                                                            : 'border-purple-500 bg-purple-50'}`
                                                        : `${theme === 'dark'
                                                            ? 'border-gray-700 hover:border-purple-500/50'
                                                            : 'border-gray-200 hover:border-purple-300'}`
                                                }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                        !shareVoice 
                                                            ? 'border-purple-500 bg-purple-500'
                                                            : `${theme === 'dark' ? 'border-gray-500' : 'border-gray-400'}`
                                                    }`}>
                                                        {!shareVoice && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-semibold mb-1 ${
                                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                        }`}>Basic Storage</h3>
                                                        <p className={`text-sm ${
                                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>Standard encrypted local storage with basic voice customization</p>
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setShareVoice(true)}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
                                                    shareVoice 
                                                        ? `${theme === 'dark'
                                                            ? 'border-purple-500 bg-purple-500/10'
                                                            : 'border-purple-500 bg-purple-50'}`
                                                        : `${theme === 'dark'
                                                            ? 'border-gray-700 hover:border-purple-500/50'
                                                            : 'border-gray-200 hover:border-purple-300'}`
                                                }`}
                                            >
                                                <div className="absolute top-0 right-0">
                                                    <div className={theme === 'dark'
                                                        ? 'bg-purple-500/10 p-1.5 rounded-bl-xl'
                                                        : 'bg-purple-100 p-1.5 rounded-bl-xl'
                                                    }>
                                                        <span className={`text-xs font-medium ${
                                                            theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                                        }`}>Recommended</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-3">
                                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                        shareVoice 
                                                            ? 'border-purple-500 bg-purple-500'
                                                            : `${theme === 'dark' ? 'border-gray-500' : 'border-gray-400'}`
                                                    }`}>
                                                        {shareVoice && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="pt-1">
                                                        <h3 className={`font-semibold mb-1 ${
                                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                        }`}>Decentralized Storage</h3>
                                                        <p className={`text-sm ${
                                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>Enhanced security with IPFS storage and federated learning</p>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>

                                        {shareVoice && (
                                            <div className="animate-fadeIn space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Give your voice model a name"
                                                    value={voiceName}
                                                    onChange={(e) => setVoiceName(e.target.value)}
                                                    className={`w-full p-3 rounded-lg focus:outline-none ${
                                                        theme === 'dark'
                                                            ? 'bg-gray-800/50 border-purple-500/20 text-white placeholder-gray-400 focus:border-purple-500'
                                                            : 'bg-white border-purple-200 text-gray-900 placeholder-gray-500 focus:border-purple-400'
                                                    } border`}
                                                />
                                                <div className={`rounded-lg p-3 border ${
                                                    theme === 'dark'
                                                        ? 'bg-purple-500/5 border-purple-500/10'
                                                        : 'bg-purple-50 border-purple-100'
                                                }`}>
                                                    <p className={theme === 'dark' ? 'text-sm text-purple-300' : 'text-sm text-purple-600'}>
                                                        <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}>✨ Pro tip:</span> Give your voice model a memorable name 
                                                        to easily identify it when using multiple voices.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleUpload}
                                        disabled={!voiceFile || isUploading || (shareVoice && !voiceName.trim())}
                                        className={`w-full py-3 text-white rounded-lg transition-colors duration-200 flex items-center justify-center ${
                                            !voiceFile || isUploading || (shareVoice && !voiceName.trim())
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-purple-500 hover:bg-purple-600'
                                        }`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : 'Upload Voice Sample'}
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Success Modal */}
                    {showSuccessModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className={`p-8 rounded-2xl max-w-md w-full mx-4 transform transition-all ${
                                theme === 'dark'
                                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/20'
                                    : 'bg-white border-purple-200'
                                } border`}>
                                <div className="mb-6 text-center">
                                    <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Success!</h3>
                                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                        {shareVoice 
                                            ? `Your voice model "${voiceName}" has been securely stored on the decentralized network.`
                                            : 'Your voice has been uploaded successfully.'}
                                    </p>
                                </div>
                                
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleNavigate('/configurator')}
                                        className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200"
                                    >
                                        Go to AI Configurator
                                    </button>
                                    <button
                                        onClick={() => handleNavigate('/app')}
                                        className={`w-full py-3 text-white rounded-lg transition-colors duration-200 ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 hover:bg-gray-600'
                                                : 'bg-gray-500 hover:bg-gray-400'
                                        }`}
                                    >
                                        Return to Main App
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </AuthProvider>
        </AuthContextProvider>
    );
}
