'use client';

import React from 'react';
import { SudokuBoard as SudokuBoardType } from '../types';
import { isAsteriskCell } from './SudokuGenerator';

interface SudokuBoardProps {
  board: SudokuBoardType;
  size: 4 | 6 | 9;
  title?: string;
  isPreview?: boolean;
  isPrint?: boolean;
  showTitle?: boolean;
  isInteractive?: boolean;
  originalBoard?: SudokuBoardType;
  focusedCell?: [number, number] | null;
  errors?: Set<string>;
  onCellClick?: (row: number, col: number) => void;
  onKeyDown?: (e: React.KeyboardEvent, row: number, col: number) => void;
}

export default function SudokuBoard({
  board,
  size,
  title = '',
  isPreview = false,
  isPrint = false,
  showTitle = true,
  isInteractive = false,
  originalBoard,
  focusedCell,
  errors,
  onCellClick,
  onKeyDown
}: SudokuBoardProps) {
  
  const getCellValue = (row: number, col: number) => {
    const value = board[row][col];
    return value || '';
  };

  // Handle keyboard input with asterisk validation
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!isInteractive || !onKeyDown) return;
    
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      // If it's a number key and this is an editable cell
      if (originalBoard && originalBoard[row][col] === null && /^[1-9]$/.test(e.key)) {
        // Pass to parent handler - validation will be done there
        onKeyDown(e, row, col);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        onKeyDown(e, row, col);
      }
      return;
    }
    
    // Handle arrow keys for navigation
    onKeyDown(e, row, col);
  };

  const getCellClassName = (row: number, col: number) => {
    let baseSize;
    if (isPrint) {
      baseSize = 'w-[48px] h-[48px] text-[25px]'; // 9x9 only
    } else if (isPreview) {
      baseSize = 'w-8 h-8 text-[44px]'; // 9x9 only
    } else if (isInteractive) {
      baseSize = 'w-12 h-12 text-lg'; // 9x9 only
    } else {
      baseSize = 'w-10 h-10 text-base'; // 9x9 only
    }

    let className = `${baseSize} text-center font-bold flex items-center justify-center `;
    
    if (isInteractive) {
      className += 'border border-gray-400 focus:outline-none cursor-pointer ';
    } else if (isPreview || isPrint) {
      className += 'border border-gray-400 ';
    } else {
      className += 'outline outline-1 outline-gray-400 ';
    }

    // Add thicker borders for 3x3 box boundaries
    if (row === 2 || row === 5) className += 'border-b-2 border-b-gray-600 ';
    if (col === 2 || col === 5) className += 'border-r-2 border-r-gray-600 ';

    // Background colors based on cell type and asterisk pattern
    if (isPreview || isPrint) {
      // Print/preview mode: show asterisk pattern
      if (isAsteriskCell(row, col)) {
        className += 'bg-gray-200 text-black ';
      } else {
        className += 'bg-white text-black ';
      }
    } else if (isInteractive && originalBoard) {
      if (originalBoard[row][col] !== null) {
        // Initial numbers: check if it's an asterisk cell
        if (isAsteriskCell(row, col)) {
          className += 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 '; // Gray background for asterisk initial numbers
        } else {
          className += 'bg-white dark:bg-white text-gray-800 dark:text-gray-800 '; // White background for regular initial numbers
        }
      } else {
        // User input cells: check if this is an asterisk cell
        if (isAsteriskCell(row, col)) {
          className += 'bg-gray-200 dark:bg-gray-700 '; // Gray background for asterisk cells
        } else {
          className += 'bg-white dark:bg-white '; // White background for regular cells
        }
        
        // User entered numbers are blue
        if (board[row][col] !== null) {
          className += 'text-blue-600 dark:text-blue-400 ';
        } else {
          className += 'text-gray-500 dark:text-gray-400 ';
        }
      }
    } else {
      // Non-interactive mode (print/preview)
      const cellValue = board[row][col];
      if (cellValue !== null) {
        // Filled cells
        if (isAsteriskCell(row, col)) {
          className += 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ';
        } else {
          className += 'bg-white dark:bg-white text-gray-800 dark:text-gray-800 ';
        }
      } else {
        // Empty cells: show pattern
        if (isAsteriskCell(row, col)) {
          className += 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 ';
        } else {
          className += 'bg-white dark:bg-white text-gray-500 dark:text-gray-400 ';
        }
      }
    }

    // Focus and error states
    if (isInteractive) {
      if (focusedCell && focusedCell[0] === row && focusedCell[1] === col) {
        className += 'ring-2 ring-blue-500 ring-inset ';
      }
      
      if (errors && errors.has(`${row}-${col}`)) {
        className += 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 ';
      }
    }
    
    return className;
  };

  return (
    <div className={`${isPreview ? 'mb-8' : 'mb-6'} mx-auto`}>
      {showTitle && title && (
        <h3 className={`${isPreview ? 'text-xl mb-4' : 'text-2xl mb-4'} font-bold text-center ${isPreview || isPrint ? 'text-black' : 'text-gray-800 dark:text-white'}`}>
          {title}
        </h3>
      )}
      <div 
        className={`grid gap-0 mx-auto ${isInteractive ? 'border-2 border-gray-600' : 'outline outline-2 outline-gray-600'}`}
        style={{
          gridTemplateColumns: 'repeat(9, 1fr)',
          gridTemplateRows: 'repeat(9, 1fr)',
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex)}
              onClick={() => isInteractive && onCellClick && onCellClick(rowIndex, colIndex)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
              tabIndex={isInteractive ? 0 : -1}
            >
              {getCellValue(rowIndex, colIndex)}
            </div>
          ))
        )}
      </div>
      
      {/* Asterisk Sudoku Legend */}
      {showTitle && !isPrint && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Asterisk Sudoku: Numbers must not repeat in the asterisk pattern (gray cells)
          </p>
        </div>
      )}
    </div>
  );
}
