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

        // Validate file type
        const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg'];
        if (!validTypes.includes(voiceFile.type)) {
            alert('Please upload a valid WAV or MP3 file.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(10); // Initial progress indicator

        try {
            const response = await apiService.cloneVoice(voiceFile, shareVoice);
            setShowSuccessModal(true); // Show the modal instead of confirm dialog
            
            // Reset state
            setVoiceFile(null);
            setShareVoice(false);
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

    // Add navigation handlers
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

                        {/* Information Banner */}
                        <section className="mb-12">
                            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 
                                        rounded-2xl border border-purple-500/20 p-6">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

                                <div className="relative">
                                    <h2 className="text-xl font-bold text-purple-400 mb-4">How Voice Customization Works</h2>
                                    <div className="space-y-4 text-gray-300">
                                        <p>
                                            Our voice customization feature uses advanced AI to learn your voice patterns and create a unique voice model for your AI agent.
                                            This allows for more natural and personalized interactions.
                                        </p>
                                        <div className="bg-gray-800/50 p-4 rounded-lg">
                                            <h3 className="text-purple-400 font-semibold mb-2">Privacy & Security</h3>
                                            <ul className="list-disc list-inside space-y-2 text-sm">
                                                <li>Your voice data is encrypted end-to-end</li>
                                                <li>Voice models are stored securely on IPFS</li>
                                                <li>Only you can authorize the use of your voice model</li>
                                                <li>Optional participation in federated learning to improve the system</li>
                                            </ul>
                                        </div>
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

                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                        <input
                                            type="checkbox"
                                            id="share-voice"
                                            checked={shareVoice}
                                            onChange={(e) => setShareVoice(e.target.checked)}
                                            className="rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-700"
                                        />
                                        <label htmlFor="share-voice">
                                            Share my voice data (encrypted) to help improve the system through federated learning
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleUpload}
                                        disabled={!voiceFile || isUploading}
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

                    {/* Add Success Modal */}
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
                                    <p className="text-gray-300">Your voice has been uploaded successfully. Where would you like to go next?</p>
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
