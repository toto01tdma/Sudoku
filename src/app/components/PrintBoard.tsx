'use client';

import { useState, useEffect } from 'react';
import { SudokuBoard, SudokuType, getSudokuType, AnyBoard } from './table_board';
import { ClassicSudokuBoard, DiagonalSudokuBoard, AlphabetSudokuBoard, EvenOddSudokuBoard, ThaiAlphabetSudokuBoard, ConsecutiveSudokuBoard } from './table_board';
import { ConsecutiveConstraints } from './table_board/consecutive_sudoku_board/SudokuGenerator';

interface PrintBoardProps {
  size: 4 | 6 | 9;
  sudokuType: SudokuType;
  onBack: () => void;
}

export default function PrintBoard({ size, sudokuType, onBack }: PrintBoardProps) {
  const [boards, setBoards] = useState<SudokuBoard[]>([]);
  const [solutions, setSolutions] = useState<SudokuBoard[]>([]);
  const [consecutiveConstraints, setConsecutiveConstraints] = useState<(ConsecutiveConstraints | null)[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    includeSolution: true,
    gridCount: 1,
  });

  // Generate multiple puzzles when component mounts, size changes, or grid count changes
  useEffect(() => {
    const generateMultiplePuzzles = () => {
      const sudokuConfig = getSudokuType(sudokuType);
      const newBoards: SudokuBoard[] = [];
      const newSolutions: SudokuBoard[] = [];
      const newConstraints: (ConsecutiveConstraints | null)[] = [];

      for (let i = 0; i < printSettings.gridCount; i++) {
        const result = sudokuConfig.generator.generatePuzzle(size, 'medium');
        newBoards.push(result.puzzle as AnyBoard);
        newSolutions.push(result.solution as AnyBoard);

        // Handle consecutive constraints if present
        if (sudokuType === 'consecutive' && 'constraints' in result && result.constraints) {
          newConstraints.push(result.constraints as ConsecutiveConstraints);
        } else {
          newConstraints.push(null);
        }
      }

      setBoards(newBoards);
      setSolutions(newSolutions);
      setConsecutiveConstraints(newConstraints);
    };

    generateMultiplePuzzles();
    setShowPreview(false);
  }, [size, sudokuType, printSettings.gridCount]);

  const handlePrint = () => {
    if (showPreview) {
      window.print();
    } else {
      setShowPreview(true);
    }
  };


  if (showPreview) {
    return (
      <div className="min-h-screen bg-white text-black p-4">
        <div className="mx-auto">
          <div className="print:block">
            {/* Render multiple puzzle grids in 2-per-page layout along X-axis */}
            <div className="grid-container">
              {Array.from({ length: Math.ceil(printSettings.gridCount / 2) }, (_, pageIndex) => (
                <div key={`page-${pageIndex}`} className={`${pageIndex > 0 ? 'page-break-before' : ''}`}>
                  <p className="text-start text-2xl font-bold">{sudokuType} sudoku</p>
                  <div className="flex flex-col items-center space-y-8">
                    {Array.from({ length: 2 }, (_, gridInPageIndex) => {
                      const gridIndex = pageIndex * 2 + gridInPageIndex;
                      if (gridIndex >= printSettings.gridCount) return null;
                      
                      return (
                        <div key={`puzzle-${gridIndex}`} className="grid-item w-full max-w-md">
                          {(() => {
                            const boardProps = {
                              board: (boards[gridIndex] || []) as AnyBoard,
                              size,
                              isPreview: true,
                              isPrint: true,
                              showTitle: false
                            };

                            switch (sudokuType) {
                              case 'diagonal':
                                return <DiagonalSudokuBoard {...boardProps} />;
                              case 'alphabet':
                                return <AlphabetSudokuBoard {...boardProps} />;
                              case 'even-odd':
                                return <EvenOddSudokuBoard {...boardProps} />;
                              case 'thai-alphabet':
                                return <ThaiAlphabetSudokuBoard {...boardProps} />;
                              case 'consecutive':
                                return <ConsecutiveSudokuBoard {...boardProps} constraints={consecutiveConstraints[gridIndex] || { horizontal: [], vertical: [] }} />;
                              default:
                                return <ClassicSudokuBoard {...boardProps} />;
                            }
                          })()}
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
                  {Array.from({ length: Math.ceil(solutions.length / 2) }, (_, pageIndex) => (
                    <div key={`solution-page-${pageIndex}`} className={`${pageIndex > 0 ? 'page-break-before' : ''}`}>
                      <div className="flex flex-col items-center space-y-8">
                        {Array.from({ length: 2 }, (_, solutionInPageIndex) => {
                          const solutionIndex = pageIndex * 2 + solutionInPageIndex;
                          if (solutionIndex >= solutions.length) return null;
                          
                          return (
                            <div key={`solution-${solutionIndex}`} className="grid-item w-full max-w-md">
                              {(() => {
                                const boardProps = {
                                  board: solutions[solutionIndex] as AnyBoard,
                                  size,
                                  title: `Solution ${solutionIndex + 1}`,
                                  isPreview: true,
                                  isPrint: true,
                                  showTitle: true
                                };

                                switch (sudokuType) {
                                  case 'diagonal':
                                    return <DiagonalSudokuBoard {...boardProps} />;
                                  case 'alphabet':
                                    return <AlphabetSudokuBoard {...boardProps} />;
                                  case 'even-odd':
                                    return <EvenOddSudokuBoard {...boardProps} />;
                                  case 'thai-alphabet':
                                    return <ThaiAlphabetSudokuBoard {...boardProps} />;
                                  case 'consecutive':
                                    return <ConsecutiveSudokuBoard {...boardProps} constraints={consecutiveConstraints[solutionIndex] || { horizontal: [], vertical: [] }} />;
                                  default:
                                    return <ClassicSudokuBoard {...boardProps} />;
                                }
                              })()}
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
              width: 100%;
              max-width: 120mm;
              margin: 0 auto;
            }
            
            /* Responsive grid cell sizes for A4 1-per-row layout */
            .grid-item .grid > div {
              ${size === 9 ? `
                width: 8mm !important;
                height: 8mm !important;
                font-size: 14px !important;
              ` : size === 6 ? `
                width: 12mm !important;
                height: 12mm !important;
                font-size: 16px !important;
              ` : `
                width: 18mm !important;
                height: 18mm !important;
                font-size: 20px !important;
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
            {(() => {
              const boardProps = {
                board: (boards[0] || []) as AnyBoard,
                size,
                title: `${getSudokuType(sudokuType).name} Preview`,
                showTitle: true
              };

              switch (sudokuType) {
                case 'diagonal':
                  return <DiagonalSudokuBoard {...boardProps} />;
                case 'alphabet':
                  return <AlphabetSudokuBoard {...boardProps} />;
                case 'even-odd':
                  return <EvenOddSudokuBoard {...boardProps} />;
                case 'thai-alphabet':
                  return <ThaiAlphabetSudokuBoard {...boardProps} />;
                case 'consecutive':
                  return <ConsecutiveSudokuBoard {...boardProps} constraints={consecutiveConstraints[0] || { horizontal: [], vertical: [] }} />;
                default:
                  return <ClassicSudokuBoard {...boardProps} />;
              }
            })()}
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
                  ปริ้นเฉลยด้วย
                </span>
              </label>

              <div className="flex items-center space-x-3">
                <label className="text-gray-700 dark:text-gray-300 font-medium">
                  เลือกจำนวนตาราง :
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
