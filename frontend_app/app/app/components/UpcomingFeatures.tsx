import { UpcomingFeature } from "../data";

const UpcomingFeatures: React.FC = () => {
    const upcomingFeatures: UpcomingFeature[] = [
        {
            id: 'voice-mod',
            name: 'Voice Modification',
            description: 'Customize your AI agent&apos;s voice with different accents and tones',
            icon: '🎙️',
            isBeta: true,
            eta: 'Q2 2025'
        },
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

    return (
        <section className="mb-12">
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