'use client';

import React from 'react';
import { SudokuBoard as SudokuBoardType, isOnDiagonal } from './SudokuGenerator';

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

  const getCellClassName = (row: number, col: number) => {
    let baseSize;
    if (isPrint) {
      // Smaller cells for 2-per-row layout on A4 paper
      baseSize = size === 9 ? 'w-[32px] h-[32px] text-sm' : size === 6 ? 'w-[44px] h-[44px] text-base' : 'w-[60px] h-[60px] text-lg';
    } else if (isPreview) {
      // Adjusted for preview with 2-per-row layout
      baseSize = size === 9 ? 'w-8 h-8 text-sm' : size === 6 ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg';
    } else if (isInteractive) {
      // Interactive game cells
      baseSize = 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-sm sm:text-base';
    } else {
      baseSize = 'w-10 h-10 md:w-12 md:h-12 text-base'; // Normal for editing
    }
    
    let className = `${baseSize} text-center font-bold flex items-center justify-center `;
    
    // Add outline or border based on context
    if (isInteractive) {
      className += 'border border-gray-400 focus:outline-none cursor-pointer ';
    } else {
      className += 'outline outline-1 outline-gray-400 ';
    }
    
    // Add thicker borders/outlines for box boundaries
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
    
    // Background and text colors
    if (isPreview || isPrint) {
      // DIAGONAL SUDOKU: Highlight diagonal cells with a subtle background
      if (isOnDiagonal(row, col, size)) {
        className += 'bg-blue-50 text-black ';
      } else {
        className += 'bg-white text-black ';
      }
    } else if (isInteractive && originalBoard) {
      // Interactive game styling
      if (originalBoard[row][col] !== null) {
        // Original clues - white background for all cells
        className += 'bg-white dark:bg-white text-gray-800 dark:text-gray-800 ';
      } else {
        // User-entered cells
        if (errors?.has(`${row}-${col}`)) {
          // Error styling
          className += 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 ';
        } else {
          // All user input cells - blue text on white background
          className += 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 ';
        }
      }
    } else {
      // Default styling - white background for all cells
      className += 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ';
    }
    
    // Focused cell styling for interactive mode
    if (isInteractive && focusedCell && focusedCell[0] === row && focusedCell[1] === col) {
      className += 'ring-4 ring-blue-500 ring-opacity-50 ';
      if (originalBoard && originalBoard[row][col] !== null) {
        className += 'bg-blue-100 dark:bg-blue-800 ';
      } else {
        className += 'bg-blue-50 dark:bg-blue-900 ';
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
      <div className="relative">
        <div 
          className={`grid gap-0 mx-auto ${isInteractive ? 'border-2 border-gray-600' : 'outline outline-2 outline-gray-600'}`}
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            width: 'fit-content'
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((_, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={isInteractive && onCellClick ? () => onCellClick(rowIndex, colIndex) : undefined}
                onKeyDown={isInteractive && onKeyDown ? (e) => onKeyDown(e, rowIndex, colIndex) : undefined}
                className={getCellClassName(rowIndex, colIndex)}
                tabIndex={isInteractive ? 0 : undefined}
                data-row={isInteractive ? rowIndex : undefined}
                data-col={isInteractive ? colIndex : undefined}
              >
                {getCellValue(rowIndex, colIndex)}
              </div>
            ))
          )}
        </div>
        
        {/* Diagonal Lines */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          {/* Main diagonal (top-left to bottom-right) */}
          <line
            x1="0"
            y1="0"
            x2="100%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400"
          />
          {/* Anti-diagonal (top-right to bottom-left) */}
          <line
            x1="100%"
            y1="0"
            x2="0"
            y2="100%"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400"
          />
        </svg>
      </div>
      
      {/* Diagonal Sudoku Legend */}
      {showTitle && !isPrint && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Diagonal Sudoku: Numbers must not repeat in diagonals (highlighted cells)
          </p>
        </div>
      )}
    </div>
  );
}
