import React from 'react';
import { tools, ToolConfig } from '../../config/tools';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface ToolsProps {
  onToolSelect: (tool: ToolConfig | null) => void;
  selectedTool: ToolConfig | null;
}

export const Tools: React.FC<ToolsProps> = ({ onToolSelect, selectedTool }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`fixed right-0 top-[64px] h-[calc(100vh-64px)] transition-all duration-300 ease-in-out 
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-1/2 -translate-x-full transform bg-[#1E1E1E] p-2 
          shadow-lg rounded-l-lg border-0 text-white flex items-center gap-2"
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

      <div className="h-full w-96 bg-[#1E1E1E] shadow-lg text-white">
        {selectedTool ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#2D2D2D]">
              <h2 className="text-lg font-semibold">{selectedTool.name}</h2>
              <button
                onClick={() => onToolSelect(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <selectedTool.component />
            </div>
          </div>
        ) : (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-6">Tools</h2>
            <div className="grid grid-cols-2 gap-4">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onToolSelect(tool)}
                  className="group bg-[#2D2D2D] rounded-lg p-4 text-left hover:bg-[#3D3D3D] 
                    transition-all duration-200 border border-gray-700 hover:border-gray-600"
                >
                  <div className="mb-3 w-12 h-12 bg-[#4D4D4D] rounded-lg flex items-center justify-center group-hover:bg-[#5D5D5D]">
                    {tool.icon}
                  </div>
                  <h3 className="font-medium text-white mb-1">{tool.name}</h3>
                  <p className="text-sm text-gray-400">{tool.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 