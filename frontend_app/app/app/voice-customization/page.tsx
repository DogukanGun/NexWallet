'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { AuthProvider as AuthContextProvider } from '@/app/context/AuthContext';
import AuthProvider from '../../providers/AuthProvider'
import { apiService } from '@/app/services/ApiService';

export default function VoiceCustomizationPage() {
    const router = useRouter();
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
                <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white page-with-navbar">
                    <div className="container mx-auto px-4 py-8">
                        {/* Header Section */}
                        <section className="mb-12">
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Voice <span className="text-purple-400">Customization</span>
                            </h1>
                            <p className="text-gray-400 max-w-2xl">
                                Personalize your AI agent with your own voice. Create a more authentic and engaging interaction experience.
                            </p>
                        </section>

                        {/* Enhanced Information Banner */}
                        <section className="mb-12">
                            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 
                                        rounded-2xl border border-purple-500/20 p-6">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

                                <div className="relative">
                                    <h2 className="text-xl font-bold text-purple-400 mb-4">Next-Gen Voice AI Technology</h2>
                                    <div className="space-y-6 text-gray-300">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-white">Basic Voice Cloning</h3>
                                                <ul className="list-disc list-inside space-y-2 text-sm">
                                                    <li>Create your personal AI voice model</li>
                                                    <li>Secure local storage</li>
                                                    <li>Basic voice customization</li>
                                                    <li>Standard encryption</li>
                                                </ul>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-white flex items-center">
                                                    <span className="text-purple-400">Advanced Decentralized Features</span>
                                                    <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Optional</span>
                                                </h3>
                                                <ul className="list-disc list-inside space-y-2 text-sm">
                                                    <li>Decentralized storage on Filecoin IPFS</li>
                                                    <li>Contribute to federated learning</li>
                                                    <li>Enhanced voice model quality</li>
                                                    <li>Double-layer encryption protection</li>
                                                </ul>
                                                <button 
                                                    onClick={() => setShowStorageInfo(!showStorageInfo)}
                                                    className="text-purple-400 text-sm hover:text-purple-300 flex items-center"
                                                >
                                                    Learn more about decentralized storage
                                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {showStorageInfo && (
                                            <div className="mt-6 bg-black/30 p-6 rounded-xl border border-purple-500/20">
                                                <h4 className="text-lg font-semibold text-purple-400 mb-4">How Decentralized Storage Works</h4>
                                                <div className="space-y-4">
                                                    <p className="text-sm">
                                                        When you choose to use decentralized storage, your voice model is:
                                                    </p>
                                                    <ol className="list-decimal list-inside space-y-3 text-sm">
                                                        <li><span className="text-purple-400">Double Encrypted:</span> First by your personal key, then by our system</li>
                                                        <li><span className="text-purple-400">Stored on IPFS:</span> A secure, decentralized storage network powered by Filecoin</li>
                                                        <li><span className="text-purple-400">Always Under Your Control:</span> Only you can authorize its use</li>
                                                        <li><span className="text-purple-400">Contributes to Learning:</span> Helps improve the AI while maintaining privacy</li>
                                                    </ol>
                                                    <div className="bg-purple-500/10 p-4 rounded-lg mt-4">
                                                        <p className="text-xs text-purple-300">
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
                            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                                <h2 className="text-xl font-bold text-white mb-6">Upload Voice Sample</h2>
                                
                                <div className="space-y-6">
                                    <div className="border-2 border-dashed border-purple-500/20 rounded-xl p-6 text-center">
                                        <input
                                            id="voice-upload"
                                            type="file"
                                            accept="audio/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label htmlFor="voice-upload" className="cursor-pointer">
                                            <div className="mx-auto w-12 h-12 mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                </svg>
                                            </div>
                                            <p className="text-purple-400 mb-2">Click to upload or drag and drop</p>
                                            <p className="text-sm text-gray-400">WAV or MP3 up to 10MB</p>
                                        </label>
                                    </div>

                                    {voiceFile && (
                                        <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between">
                                            <span className="text-purple-400">{voiceFile.name}</span>
                                            <button
                                                onClick={() => setVoiceFile(null)}
                                                className="text-gray-400 hover:text-red-400"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}

                                    {isUploading && (
                                        <div className="w-full bg-gray-700 rounded-full h-2">
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
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left
                                                    ${!shareVoice 
                                                        ? 'border-purple-500 bg-purple-500/10' 
                                                        : 'border-gray-700 hover:border-purple-500/50'}`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                        ${!shareVoice ? 'border-purple-500 bg-purple-500' : 'border-gray-500'}`}>
                                                        {!shareVoice && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-white mb-1">Basic Storage</h3>
                                                        <p className="text-sm text-gray-400">Standard encrypted local storage with basic voice customization</p>
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setShareVoice(true)}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden
                                                    ${shareVoice 
                                                        ? 'border-purple-500 bg-purple-500/10' 
                                                        : 'border-gray-700 hover:border-purple-500/50'}`}
                                            >
                                                <div className="absolute top-0 right-0">
                                                    <div className="bg-purple-500/10 p-1.5 rounded-bl-xl">
                                                        <span className="text-xs text-purple-400 font-medium">Recommended</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-3">
                                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                        ${shareVoice ? 'border-purple-500 bg-purple-500' : 'border-gray-500'}`}>
                                                        {shareVoice && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="pt-1">
                                                        <h3 className="font-semibold text-white mb-1">Decentralized Storage</h3>
                                                        <p className="text-sm text-gray-400">Enhanced security with IPFS storage and federated learning</p>
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
                                                    className="w-full p-3 bg-gray-800/50 border border-purple-500/20 rounded-lg 
                                                             text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                                />
                                                <div className="bg-purple-500/5 rounded-lg p-3 border border-purple-500/10">
                                                    <p className="text-sm text-purple-300">
                                                        <span className="text-purple-400">✨ Pro tip:</span> Give your voice model a memorable name 
                                                        to easily identify it when using multiple voices.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleUpload}
                                        disabled={!voiceFile || isUploading || (shareVoice && !voiceName.trim())}
                                        className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 
                                                 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-purple-500/20 max-w-md w-full mx-4 transform transition-all">
                                <div className="mb-6 text-center">
                                    <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                                    <p className="text-gray-300">
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
                                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
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
