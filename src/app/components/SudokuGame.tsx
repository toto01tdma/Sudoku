'use client';

import { useState, useEffect } from 'react';
import { 
  SudokuBoard, 
  SudokuCell, 
  generatePuzzle, 
  isValidMove, 
  isBoardSolved,
  isBoardComplete
} from '../utils/sudokuLogic';

interface SudokuGameProps {
  size: 4 | 6 | 9;
  onBack: () => void;
}

export default function SudokuGame({ size, onBack }: SudokuGameProps) {
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [originalBoard, setOriginalBoard] = useState<SudokuBoard>([]);
  const [solution, setSolution] = useState<SudokuBoard>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  // Generate new puzzle when component mounts or size changes
  useEffect(() => {
    const { puzzle, solution } = generatePuzzle(size, 'medium');
    setBoard(puzzle);
    setOriginalBoard(puzzle.map(row => [...row]));
    setSolution(solution);
    setSelectedCell(null);
    setErrors(new Set());
    setIsComplete(false);
  }, [size]);

  const handleCellClick = (row: number, col: number) => {
    // Only allow selection of empty cells or user-filled cells
    if (originalBoard[row][col] === null) {
      setSelectedCell([row, col]);
    }
  };

  // Get all editable cell positions
  const getEditableCells = () => {
    const editableCells: [number, number][] = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (originalBoard[row][col] === null) {
          editableCells.push([row, col]);
        }
      }
    }
    return editableCells;
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }
    
    e.preventDefault();
    const editableCells = getEditableCells();
    const currentIndex = editableCells.findIndex(([r, c]) => r === row && c === col);
    
    if (currentIndex === -1) return;
    
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowUp':
        // Find previous cell in same column or wrap around
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (editableCells[i][1] === col) {
            newIndex = i;
            break;
          }
        }
        // If no cell found above in same column, find last cell in same column
        if (newIndex === currentIndex) {
          for (let i = editableCells.length - 1; i > currentIndex; i--) {
            if (editableCells[i][1] === col) {
              newIndex = i;
              break;
            }
          }
        }
        break;
        
      case 'ArrowDown':
        // Find next cell in same column or wrap around
        for (let i = currentIndex + 1; i < editableCells.length; i++) {
          if (editableCells[i][1] === col) {
            newIndex = i;
            break;
          }
        }
        // If no cell found below in same column, find first cell in same column
        if (newIndex === currentIndex) {
          for (let i = 0; i < currentIndex; i++) {
            if (editableCells[i][1] === col) {
              newIndex = i;
              break;
            }
          }
        }
        break;
        
      case 'ArrowLeft':
        // Find previous cell in same row or wrap around
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (editableCells[i][0] === row) {
            newIndex = i;
            break;
          }
        }
        // If no cell found left in same row, find last cell in same row
        if (newIndex === currentIndex) {
          for (let i = editableCells.length - 1; i > currentIndex; i--) {
            if (editableCells[i][0] === row) {
              newIndex = i;
              break;
            }
          }
        }
        break;
        
      case 'ArrowRight':
        // Find next cell in same row or wrap around
        for (let i = currentIndex + 1; i < editableCells.length; i++) {
          if (editableCells[i][0] === row) {
            newIndex = i;
            break;
          }
        }
        // If no cell found right in same row, find first cell in same row
        if (newIndex === currentIndex) {
          for (let i = 0; i < currentIndex; i++) {
            if (editableCells[i][0] === row) {
              newIndex = i;
              break;
            }
          }
        }
        break;
    }
    
    if (newIndex !== currentIndex) {
      const [newRow, newCol] = editableCells[newIndex];
      setSelectedCell([newRow, newCol]);
      
      // Focus the new cell
      const newCellElement = document.querySelector(
        `input[data-row="${newRow}"][data-col="${newCol}"]`
      ) as HTMLInputElement;
      if (newCellElement) {
        newCellElement.focus();
      }
    }
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    if (originalBoard[row][col] !== null) return; // Can't change original clues

    const newBoard = board.map(r => [...r]);
    const numValue = value === '' ? null : parseInt(value, 10);
    
    if (numValue !== null && (numValue < 1 || numValue > size || isNaN(numValue))) {
      return; // Invalid number
    }

    newBoard[row][col] = numValue;
    setBoard(newBoard);

    // Update errors
    const newErrors = new Set(errors);
    const errorKey = `${row}-${col}`;
    
    if (numValue !== null && !isValidMove(newBoard, row, col, numValue)) {
      newErrors.add(errorKey);
    } else {
      newErrors.delete(errorKey);
    }
    
    setErrors(newErrors);

    // Don't auto-complete - let user press Check button
  };

  const handleCheck = () => {
    const newErrors = new Set<string>();
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const cell = board[row][col];
        if (cell !== null && !isValidMove(board, row, col, cell)) {
          newErrors.add(`${row}-${col}`);
        }
      }
    }
    
    setErrors(newErrors);
    
    // Check if board is completely filled
    const isComplete = isBoardComplete(board);
    
    if (newErrors.size === 0 && isComplete) {
      // Board is complete and valid - puzzle solved!
      setIsComplete(true);
      alert('Congratulations! You solved the puzzle!');
    } else if (newErrors.size > 0) {
      alert(`Found ${newErrors.size} error(s). Check the highlighted cells.`);
    } else if (!isComplete) {
      alert('Good progress! Keep filling in the empty cells.');
    }
  };

  const getCellClassName = (row: number, col: number) => {
    let className = 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-gray-400 text-center font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ';
    
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
    
    // Original clue styling
    if (originalBoard[row][col] !== null) {
      className += 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ';
    } else {
      className += 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 ';
    }
    
    // Selected cell
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      className += 'ring-2 ring-blue-500 ';
    }
    
    // Error styling
    if (errors.has(`${row}-${col}`)) {
      className += 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 ';
    }
    
    return className;
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center max-w-md w-full">
          <h1 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">
            🎉 Congratulations! 🎉
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            You solved the {size}×{size} Sudoku puzzle!
          </p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Sudoku {size}×{size}
          </h1>
          {errors.size > 0 && (
            <p className="text-red-600 dark:text-red-400 font-medium">
              {errors.size} error(s) found - check highlighted cells
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-6">
          {/* Game Board */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl">
            <div 
              className="grid gap-0 border-2 border-gray-600"
              style={{
                gridTemplateColumns: `repeat(${size}, 1fr)`,
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <input
                    key={`${rowIndex}-${colIndex}`}
                    type="text"
                    value={cell || ''}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onFocus={() => handleCellClick(rowIndex, colIndex)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    className={getCellClassName(rowIndex, colIndex)}
                    maxLength={1}
                    disabled={originalBoard[rowIndex][colIndex] !== null}
                    data-row={rowIndex}
                    data-col={colIndex}
                  />
                ))
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleCheck}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Check
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
              Fill empty cells with numbers 1-{size}
            </p>
            <p>
              Each row, column, and box must contain all numbers exactly once
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
