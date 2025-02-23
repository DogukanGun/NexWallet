import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';

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
    title: 'Telegram Integration',
    status: 'testnet',
    description: 'Connect and interact with your AI assistant through Telegram'
  },
  {
    title: 'Mobile App',
    status: 'planned',
    description: 'Native mobile applications for iOS and Android'
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

export default function RoadmapModal({ isOpen, onClose }: RoadmapModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800/50 p-6 w-full">
          <Dialog.Title className="text-2xl font-bold mb-6 text-white">Product Roadmap</Dialog.Title>
          
          <div className="relative">
            <ol className="overflow-hidden space-y-8">
              {roadmapItems.map((item, index) => (
                <li
                  key={item.title}
                  className={`relative flex-1 ${index < roadmapItems.length - 1 ? 'after:content-[""] after:w-0.5 after:h-full after:bg-indigo-600 after:inline-block after:absolute after:-bottom-11 after:left-4 lg:after:left-5' : ''}`}
                >
                  <a className="flex items-start font-medium w-full">
                    <span className={`w-8 h-8 aspect-square rounded-full flex justify-center items-center mr-3 text-sm text-white ${item.status === 'completed' ? 'bg-green-500' : item.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-600'}`}>
                      {index + 1}
                    </span>
                    <div className="block">
                      <h4 className="text-base text-white mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600 max-w-xs mb-4">{item.description}</p>
                      <span className={`text-sm px-3 py-1 rounded-full inline-block ${item.status === 'completed' ? 'bg-green-500/20 text-green-400' : item.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' : item.status === 'testnet' ? 'bg-pink-500/20 text-pink-400' :   'bg-gray-700/50 text-gray-400'}`}>
                        {item.status.replace('-', ' ')}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ol>
          </div>
          
          <button
            onClick={onClose}
            className="mt-8 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
          >
            Close
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 