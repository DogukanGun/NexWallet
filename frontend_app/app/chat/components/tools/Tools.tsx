import React from 'react';
import { tools, ToolConfig } from '../../config/tools';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ConfigurationComponent } from '../../config/tools';

interface ToolsProps {
  onToolSelect: (tool: ToolConfig | null) => void;
  selectedTool: ToolConfig | null;
  securityLevel: 'basic' | 'advanced';
}

export const Tools: React.FC<ToolsProps> = ({ onToolSelect, selectedTool, securityLevel }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`fixed right-0 top-[64px] h-[calc(100vh-64px)] z-50 transition-all duration-300 ease-in-out 
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 transform bg-[#1E1E1E] p-2 
          shadow-lg rounded-l-lg border-0 text-white flex items-center gap-2 hover:bg-[#2A2A2A] transition-colors"
      >
        {isOpen ? (
          <>
            <ChevronRight size={20} />
            <span className="rotate-180 [writing-mode:vertical-lr]">Tools</span>
          </>
        ) : (
          <>
            <ChevronLeft size={20} />
            <span className="rotate-180 [writing-mode:vertical-lr]">Tools</span>
          </>
        )}
      </button>

      <div className="h-full w-96 bg-[#2A2A2A] shadow-lg text-white">
        {!selectedTool ? (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Tools</h2>
            <div className="space-y-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    onToolSelect(tool);
                    setIsOpen(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#3D3D3D] transition-colors"
                >
                  {tool.icon}
                  <div className="text-left">
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-sm text-gray-400">{tool.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col relative">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#3D3D3D] z-10 relative">
              <h2 className="text-lg font-semibold">{selectedTool.name}</h2>
              <button
                onClick={() => onToolSelect(null)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-[#4D4D4D]"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 relative">
              {selectedTool.id === 'config' ? (
                <ConfigurationComponent />
              ) : (
                <selectedTool.component />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 