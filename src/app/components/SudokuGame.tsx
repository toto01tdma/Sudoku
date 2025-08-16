'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  SudokuBoard, 
  generatePuzzle, 
  isValidMove, 
  isBoardComplete
} from '../utils/sudokuLogic';

interface SudokuGameProps {
  size: 4 | 6 | 9;
  onBack: () => void;
}

export default function SudokuGame({ size, onBack }: SudokuGameProps) {
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [originalBoard, setOriginalBoard] = useState<SudokuBoard>([]);
  const [focusedCell, setFocusedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  // Generate new puzzle when component mounts or size changes
  useEffect(() => {
    const { puzzle } = generatePuzzle(size, 'medium');
    setBoard(puzzle);
    setOriginalBoard(puzzle.map(row => [...row]));
    setFocusedCell(null);
    setErrors(new Set());
    setIsComplete(false);
  }, [size]);

  // Focus the cell when focusedCell changes
  useEffect(() => {
    if (focusedCell) {
      const [row, col] = focusedCell;
      const cellElement = document.querySelector(
        `div[data-row="${row}"][data-col="${col}"]`
      ) as HTMLElement;
      if (cellElement) {
        cellElement.focus();
      }
    }
  }, [focusedCell]);

  const handleCellClick = (row: number, col: number) => {
    // Allow focusing on any cell
    setFocusedCell([row, col]);
  };

  // Handle keyboard navigation - works for all cells now
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      // If it's a number key and this is an editable cell, handle input
      if (originalBoard[row][col] === null && /^[1-9]$/.test(e.key)) {
        const numValue = parseInt(e.key, 10);
        if (numValue >= 1 && numValue <= size) {
          handleCellChange(row, col, e.key);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Handle deletion for editable cells
        if (originalBoard[row][col] === null) {
          handleCellChange(row, col, '');
        }
      }
      return;
    }
    
    e.preventDefault();
    
    let newRow = row;
    let newCol = col;
    
    switch (e.key) {
      case 'ArrowUp':
        newRow = row > 0 ? row - 1 : size - 1;
        break;
      case 'ArrowDown':
        newRow = row < size - 1 ? row + 1 : 0;
        break;
      case 'ArrowLeft':
        newCol = col > 0 ? col - 1 : size - 1;
        break;
      case 'ArrowRight':
        newCol = col < size - 1 ? col + 1 : 0;
        break;
    }
    
    setFocusedCell([newRow, newCol]);
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

    // Clear any previous errors since we're not checking during gameplay
    setErrors(new Set());
  };

  const handleCheck = async () => {
    // Check if board is completely filled first
    const isComplete = isBoardComplete(board);
    
    if (!isComplete) {
      await Swal.fire({
        title: 'Incomplete Puzzle',
        text: 'Please fill in all empty cells before checking your solution.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // Only validate if board is complete
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
    
    if (newErrors.size === 0) {
      // Board is complete and valid - puzzle solved!
      setIsComplete(true);
      await Swal.fire({
        title: 'Congratulations!',
        text: 'You solved the puzzle!',
        icon: 'success',
        confirmButtonText: 'Play Again'
      });
    }
    // No alert for errors - just highlight incorrect cells
  };

  const getCellClassName = (row: number, col: number) => {
    let className = 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-gray-400 text-center font-bold text-sm sm:text-base focus:outline-none cursor-pointer flex items-center justify-center ';
    
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
      // User-entered cells - always blue during gameplay
      if (errors.has(`${row}-${col}`) && isBoardComplete(board)) {
        // Only show error styling after Check is pressed and board is complete
        className += 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 ';
      } else {
        className += 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 ';
      }
    }
    
    // Focused cell - apply focus styling on top
    if (focusedCell && focusedCell[0] === row && focusedCell[1] === col) {
      className += 'ring-4 ring-blue-500 ring-opacity-50 ';
      if (originalBoard[row][col] !== null) {
        className += 'bg-blue-100 dark:bg-blue-800 ';
      } else {
        className += 'bg-blue-50 dark:bg-blue-900 ';
      }
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
          {errors.size > 0 && isBoardComplete(board) && (
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
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    className={getCellClassName(rowIndex, colIndex)}
                    tabIndex={0}
                    data-row={rowIndex}
                    data-col={colIndex}
                  >
                    {cell || ''}
                  </div>
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
              Click any cell to focus it, then use number keys (1-{size}) to enter values
            </p>
            <p className="mb-2">
              Use arrow keys to navigate between cells
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
