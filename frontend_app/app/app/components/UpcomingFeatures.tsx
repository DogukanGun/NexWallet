import { UpcomingFeature } from "../data";
import Link from 'next/link';

const UpcomingFeatures: React.FC = () => {
    const upcomingFeatures: UpcomingFeature[] = [
        {
            id: 'character-analysis',
            name: 'Character Analysis',
            description: 'AI-powered personality analysis and behavior prediction',
            icon: '🧠',
            isBeta: false,
            eta: 'Q2 2025'
        },
        {
            id: 'specialized-agents',
            name: 'Specialized Agents',
            description: 'Topic-specific AI agents for finance, legal, tech, and more',
            icon: '🤖',
            isBeta: false,
            eta: 'Q3 2025'
        }
    ];
    
    const releasedFeatures: UpcomingFeature[] = [
        {
            id: 'voice-mod',
            name: 'Voice Customization',
            description: 'Customize your AI agent\'s voice with different accents and tones',
            icon: '🎙️',
            isBeta: true,
            eta: 'Released'
        }
    ];

    return (
        <section className="mb-12">
            {releasedFeatures.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                        <span className="mr-2">✨</span> Recently Released
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {releasedFeatures.map((feature) => (
                            <Link 
                                key={feature.id}
                                href="/app/voice-customization"
                                className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-500/10 to-blue-700/10 
                                backdrop-blur-sm rounded-xl border border-blue-500/20 hover:border-blue-500 
                                transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                <div className="absolute top-3 right-3">
                                    {feature.isBeta && (
                                        <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                                            In Beta
                                        </span>
                                    )}
                                </div>
                                <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
                                    <span className="text-2xl">{feature.icon}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-blue-400 hover:text-blue-300 mb-2">{feature.name}</h3>
                                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                                <div className="flex items-center text-blue-400/50 text-sm group-hover:translate-x-2 transition-transform">
                                    Get Started
                                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                <span className="mr-2">🔮</span> Coming Soon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingFeatures.map((feature) => (
                    <div key={feature.id}
                        className="relative overflow-hidden p-6 bg-gradient-to-br from-gray-800/30 to-gray-700/30 
                       backdrop-blur-sm rounded-xl border border-gray-700">
                        <div className="absolute top-3 right-3">
                            <span className="bg-blue-500/80 text-white text-xs px-3 py-1 rounded-full">
                                {feature.eta}
                            </span>
                        </div>
                        <div className="p-3 bg-gray-700/20 rounded-xl w-fit mb-4">
                            <span className="text-2xl">{feature.icon}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">{feature.name}</h3>
                        <p className="text-gray-500 text-sm">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default UpcomingFeatures;