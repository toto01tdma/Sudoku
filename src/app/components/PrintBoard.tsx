'use client';

import { useState, useEffect } from 'react';
import { SudokuBoard, generatePuzzle } from '../utils/sudokuLogic';

interface PrintBoardProps {
  size: 4 | 6 | 9;
  onBack: () => void;
}

export default function PrintBoard({ size, onBack }: PrintBoardProps) {
  const [boards, setBoards] = useState<SudokuBoard[]>([]);
  const [solutions, setSolutions] = useState<SudokuBoard[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    includeSolution: true,
    gridCount: 1,
  });

  // Generate multiple puzzles when component mounts, size changes, or grid count changes
  useEffect(() => {
    const generateMultiplePuzzles = () => {
      const newBoards: SudokuBoard[] = [];
      const newSolutions: SudokuBoard[] = [];
      
      for (let i = 0; i < printSettings.gridCount; i++) {
        const { puzzle, solution } = generatePuzzle(size, 'medium');
        newBoards.push(puzzle);
        newSolutions.push(solution);
      }
      
      setBoards(newBoards);
      setSolutions(newSolutions);
    };
    
    generateMultiplePuzzles();
    setShowPreview(false);
  }, [size, printSettings.gridCount]);

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
      // Smaller cells for 2-per-row layout on A4 paper
      baseSize = size === 9 ? 'w-[32px] h-[32px] text-sm' : size === 6 ? 'w-[44px] h-[44px] text-base' : 'w-[60px] h-[60px] text-lg';
    } else if (isPreview) {
      // Adjusted for preview with 2-per-row layout
      baseSize = size === 9 ? 'w-8 h-8 text-sm' : size === 6 ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg';
    } else {
      baseSize = 'w-10 h-10 md:w-12 md:h-12 text-base'; // Normal for editing
    }
    
    let className = `${baseSize} outline outline-1 outline-gray-400 text-center font-bold flex items-center justify-center `;
    
    // Add thicker outlines for box boundaries
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
    <div className={`${isPreview ? 'mb-8' : 'mb-6'} mx-auto`}>
      {/* {showTitle && title && (
        <h3 className={`${isPreview ? 'text-xl mb-4' : 'text-2xl mb-4'} font-bold text-center ${isPreview || isPrint ? 'text-black' : 'text-gray-800 dark:text-white'}`}>
          {title}
        </h3>
      )} */}
      <div 
        className="grid gap-0 outline outline-2 outline-gray-600 mx-auto"
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
        <div className="mx-auto">          
          <div className="print:block">
            {/* Render multiple puzzle grids in 2-per-row layout */}
            <div className="grid-container">
              {Array.from({ length: Math.ceil(printSettings.gridCount / 2) }, (_, rowIndex) => (
                <div key={`row-${rowIndex}`} className={`grid-row ${rowIndex > 0 ? 'page-break-before' : ''}`}>
                  <div className="flex justify-between gap-4 mb-8">
                    {Array.from({ length: 2 }, (_, colIndex) => {
                      const gridIndex = rowIndex * 2 + colIndex;
                      if (gridIndex >= printSettings.gridCount) return null;
                      
                      return (
                        <div key={`puzzle-${gridIndex}`} className="grid-item flex-1">
                          {renderBoard(boards[gridIndex] || [], '', true, true, false)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {printSettings.includeSolution && solutions.length > 0 && (
              <div className="page-break-before">
                <div className="grid-container">
                  {Array.from({ length: Math.ceil(solutions.length / 2) }, (_, rowIndex) => (
                    <div key={`solution-row-${rowIndex}`} className={`grid-row ${rowIndex > 0 ? 'page-break-before' : ''}`}>
                      <div className="flex justify-between gap-4 mb-8">
                        {Array.from({ length: 2 }, (_, colIndex) => {
                          const solutionIndex = rowIndex * 2 + colIndex;
                          if (solutionIndex >= solutions.length) return null;
                          
                          return (
                            <div key={`solution-${solutionIndex}`} className="grid-item flex-1">
                              {renderBoard(solutions[solutionIndex], `Solution ${solutionIndex + 1}`, true, true, true)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
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
          </div>

          <div className="mt-6 text-center text-gray-600 print:hidden">
            <p className="text-sm">
              This preview shows how the puzzle will look when printed.
            </p>
            <p className="text-sm">
              {printSettings.gridCount > 1 ? `${printSettings.gridCount} puzzle grids will be printed` : 'One puzzle grid will be printed'}
              {printSettings.includeSolution ? ' along with the solution.' : '.'}
            </p>
          </div>
        </div>

        {/* Print-specific styles */}
        <style jsx>{`
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            
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
            
            .grid-container {
              width: 100%;
            }
            
            .grid-row {
              width: 100%;
              margin-bottom: 20mm;
            }
            
            .grid-item {
              flex: 1;
              max-width: calc(50% - 2mm);
            }
            
            /* Responsive grid cell sizes for A4 2-per-row layout */
            .grid-item .grid > div {
              ${size === 9 ? `
                width: 4.5mm !important;
                height: 4.5mm !important;
                font-size: 10px !important;
              ` : size === 6 ? `
                width: 6mm !important;
                height: 6mm !important;
                font-size: 12px !important;
              ` : `
                width: 8mm !important;
                height: 8mm !important;
                font-size: 14px !important;
              `}
              line-height: 1 !important;
            }
            
            /* Adjust title sizes for print */
            h1 {
              font-size: 18px !important;
              margin-bottom: 10mm !important;
            }
            
            h3 {
              font-size: 14px !important;
              margin-bottom: 5mm !important;
            }
          }
          
          /* Screen preview styles */
          
          .grid-row .flex {
            align-items: flex-start;
          }
          
          .grid-item {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Preview and print your Sudoku puzzle
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          {/* Board Preview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
            {renderBoard(boards[0] || [], 'Puzzle Preview')}
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
              
              <div className="flex items-center space-x-3">
                <label className="text-gray-700 dark:text-gray-300 font-medium">
                  Number of grids:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={printSettings.gridCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 1 && value <= 10) {
                      setPrintSettings(prev => ({
                        ...prev,
                        gridCount: value
                      }));
                    } else if (e.target.value === '') {
                      setPrintSettings(prev => ({
                        ...prev,
                        gridCount: 1
                      }));
                    }
                  }}
                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">(1-10)</span>
              </div>
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
            <p className="mb-2">
              You can choose to include or exclude the solution grid
            </p>
            <p>
              Specify the number of puzzle grids (1-10) to print multiple copies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
