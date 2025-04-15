import { useTheme } from '@/store/ThemeContext';

type ProgressIndicatorProps = {
  currentSection: number;
  isStepValid: (step: number) => boolean;
};

export const ProgressIndicator = ({ currentSection, isStepValid }: ProgressIndicatorProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="max-w-3xl mx-auto px-4 mb-8">
      <div className="flex items-center justify-between relative">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex flex-col items-center z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${currentSection === step 
                ? 'bg-blue-500 text-white' 
                : isStepValid(step) 
                  ? 'bg-green-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-blue-100 text-blue-500'}`}>
              {isStepValid(step) ? '✓' : step}
            </div>
            <span className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-blue-400'}`}>
              {step === 1 ? 'Chains' 
                : step === 2 ? 'Knowledge' 
                : step === 3 ? 'LLM' 
                : 'Agent Type'}
            </span>
          </div>
        ))}
        <div className={`absolute h-0.5 ${isDark ? 'bg-gray-700' : 'bg-blue-100'} left-0 right-0 top-4 -z-0`}></div>
      </div>
    </div>
  );
}; 