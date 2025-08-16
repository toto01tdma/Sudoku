'use client';

import { useState, useEffect } from 'react';
import { SudokuBoard, generatePuzzle } from '../utils/sudokuLogic';

interface PrintBoardProps {
  size: 4 | 6 | 9;
  onBack: () => void;
}

export default function PrintBoard({ size, onBack }: PrintBoardProps) {
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [solution, setSolution] = useState<SudokuBoard>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    includeText: true,
    includeSolution: true,
  });

  // Generate new puzzle when component mounts or size changes
  useEffect(() => {
    const { puzzle, solution } = generatePuzzle(size, 'medium');
    setBoard(puzzle);
    setSolution(solution);
    setShowPreview(false);
  }, [size]);

  const handlePrint = () => {
    if (showPreview) {
      window.print();
    } else {
      setShowPreview(true);
    }
  };

  const getCellValue = (board: SudokuBoard, row: number, col: number) => {
    const value = board[row][col];
    return value || '';
  };

  const getCellClassName = (row: number, col: number, isPreview = false, isPrint = false) => {
    let baseSize;
    if (isPrint) {
      baseSize = 'w-12 h-12 text-lg'; // Larger for actual printing
    } else if (isPreview) {
      baseSize = 'w-10 h-10 text-base'; // Medium for preview
    } else {
      baseSize = 'w-10 h-10 md:w-12 md:h-12 text-base'; // Normal for editing
    }
    
    let className = `${baseSize} border border-gray-400 text-center font-bold flex items-center justify-center `;
    
    // Add thicker borders for box boundaries
    if (size === 4) {
      if (row === 1) className += 'border-b-2 border-b-gray-600 ';
      if (col === 1) className += 'border-r-2 border-r-gray-600 ';
    } else if (size === 6) {
      if (row === 1 || row === 3) className += 'border-b-2 border-b-gray-600 ';
      if (col === 2) className += 'border-r-2 border-r-gray-600 ';
    } else if (size === 9) {
      if (row === 2 || row === 5) className += 'border-b-2 border-b-gray-600 ';
      if (col === 2 || col === 5) className += 'border-r-2 border-r-gray-600 ';
    }
    
    if (isPreview || isPrint) {
      className += 'bg-white text-black ';
    } else {
      className += 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ';
    }
    
    return className;
  };

  const renderBoard = (boardToRender: SudokuBoard, title: string, isPreview = false, isPrint = false, showTitle = true) => (
    <div className={`${isPreview ? 'mb-8' : 'mb-6'}`}>
      {showTitle && (
        <h3 className={`${isPreview ? 'text-xl mb-4' : 'text-2xl mb-4'} font-bold text-center ${isPreview || isPrint ? 'text-black' : 'text-gray-800 dark:text-white'}`}>
          {title}
        </h3>
      )}
      <div 
        className="grid gap-0 border-2 border-gray-600 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          width: 'fit-content'
        }}
      >
        {boardToRender.map((row, rowIndex) =>
          row.map((_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex, isPreview, isPrint)}
            >
              {getCellValue(boardToRender, rowIndex, colIndex)}
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (showPreview) {
    return (
      <div className="min-h-screen bg-white text-black p-8">
        <div className="max-w-4xl mx-auto">
          {printSettings.includeText && (
            <h1 className="text-3xl font-bold text-center mb-8 text-black">
              Sudoku {size}×{size} Puzzle
            </h1>
          )}
          
          <div className="print:block">
            {renderBoard(board, 'Puzzle', true, true, printSettings.includeText)}
            
            {printSettings.includeSolution && (
              <div className="page-break-before">
                {renderBoard(solution, 'Solution', true, true, printSettings.includeText)}
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center mt-8 print:hidden">
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Print
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Back to Edit
            </button>
            <button
              onClick={onBack}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Back to Menu
            </button>
          </div>

          <div className="mt-6 text-center text-gray-600 print:hidden">
            <p className="text-sm">
              This preview shows how the puzzle will look when printed.
            </p>
            <p className="text-sm">
              {printSettings.includeSolution ? 'Both puzzle and solution will be printed.' : 'Only the puzzle will be printed.'}
            </p>
          </div>
        </div>

        {/* Print-specific styles */}
        <style jsx>{`
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white !important;
              color: black !important;
            }
            
            .page-break-before {
              page-break-before: always;
            }
            
            .print\\:hidden {
              display: none !important;
            }
            
            .print\\:block {
              display: block !important;
            }
            
            /* Ensure larger grid cells for better printing */
            .grid > div {
              width: 48px !important;
              height: 48px !important;
              font-size: 18px !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Print Sudoku {size}×{size}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Preview and print your Sudoku puzzle
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          {/* Board Preview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
            {renderBoard(board, 'Puzzle Preview')}
          </div>

          {/* Print Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
              Print Settings
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printSettings.includeText}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    includeText: e.target.checked
                  }))}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Include titles and text
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printSettings.includeSolution}
                  onChange={(e) => setPrintSettings(prev => ({
                    ...prev,
                    includeSolution: e.target.checked
                  }))}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Include solution grid
                </span>
              </label>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Print Preview
            </button>
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Back
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md text-center text-sm text-gray-600 dark:text-gray-300">
            <p className="mb-2">
              Configure your print settings above, then click &quot;Print Preview&quot;
            </p>
            <p>
              You can choose to include or exclude titles and the solution grid
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
