import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useTheme } from '@/store/ThemeContext';

interface RoadmapItem {
  title: string;
  status: 'completed' | 'in-progress' | 'planned' | 'testnet';
  description: string;
}

const roadmapItems: RoadmapItem[] = [
  {
    title: 'Web Application Launch',
    status: 'completed',
    description: 'Initial release of the web application with core features'
  },
  {
    title: 'Mobile App',
    status: 'in-progress',
    description: 'Native mobile applications for iOS and Android'
  },
  {
    title: 'Voice Customization (Beta)',
    status: 'planned',
    description: 'Customize your AI assistant with different voice profiles and styles'
  },
  {
    title: 'Advanced Analytics',
    status: 'planned',
    description: 'Detailed insights and usage statistics'
  }
];

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoadmapModal = ({ isOpen, onClose }: RoadmapModalProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getStatusStyles = (status: RoadmapItem['status']) => {
    const baseStyles = 'text-sm px-3 py-1 rounded-full inline-block';
    switch (status) {
      case 'completed':
        return `${baseStyles} ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-600'}`;
      case 'in-progress':
        return `${baseStyles} ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`;
      case 'testnet':
        return `${baseStyles} ${isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`;
      default:
        return `${baseStyles} ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`;
    }
  };

  const getNumberStyles = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed':
        return isDark ? 'bg-green-700 text-white' : 'bg-green-500 text-white';
      case 'in-progress':
        return isDark ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`mx-auto max-w-lg max-h-[90vh] overflow-y-auto w-full rounded-2xl p-6 shadow-xl ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
          <Dialog.Title className={`text-3xl font-bold mb-6 ${
            isDark 
              ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-transparent bg-clip-text' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text'
          }`}>
            Product Roadmap
          </Dialog.Title>
          
          <div className="relative">
            <ol className="overflow-hidden space-y-8">
              {roadmapItems.map((item, index) => (
                <li
                  key={item.title}
                  className={`relative flex-1 ${
                    index < roadmapItems.length - 1 
                      ? `after:content-[""] after:w-0.5 after:h-full after:inline-block after:absolute after:-bottom-11 after:left-4 lg:after:left-5 ${
                          isDark ? 'after:bg-gray-600' : 'after:bg-blue-100'
                        }`
                      : ''
                  }`}
                >
                  <div className="flex items-start font-medium w-full">
                    <span className={`w-10 h-10 aspect-square rounded-full flex justify-center items-center mr-4 text-sm ${getNumberStyles(item.status)}`}>
                      {index + 1}
                    </span>
                    <div className="block">
                      <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                        {item.title}
                      </h4>
                      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                      <span className={getStatusStyles(item.status)}>
                        {item.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          
          <button
            onClick={onClose}
            className={`w-full mt-8 px-4 py-3 rounded-lg font-medium transition-all ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Close
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default RoadmapModal; 