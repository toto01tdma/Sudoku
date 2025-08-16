'use client';

interface BoardSizeSelectionProps {
  onSizeSelect: (size: 4 | 6 | 9) => void;
  onBack: () => void;
  mode: 'play' | 'print';
}

export default function BoardSizeSelection({ onSizeSelect, onBack, mode }: BoardSizeSelectionProps) {
  const title = mode === 'play' ? 'Select Board Size to Play' : 'Select Board Size to Print';
  
  const sizeOptions = [
    { size: 4, label: '4 × 4', description: 'Beginner' },
    { size: 6, label: '6 × 6', description: 'Intermediate' },
    { size: 9, label: '9 × 9', description: 'Advanced' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          {title}
        </h1>
        
        <div className="space-y-4 mb-8">
          {sizeOptions.map(({ size, label, description }) => (
            <button
              key={size}
              onClick={() => onSizeSelect(size)}
              className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-6 px-6 rounded-lg text-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <div className="text-2xl font-bold">{label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</div>
            </button>
          ))}
        </div>
        
        <button
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
