'use client';

import React from 'react';
import { SudokuBoard as SudokuBoardType } from '../types';
import { ConsecutiveConstraints } from './SudokuGenerator';

interface SudokuBoardProps {
  board: SudokuBoardType;
  size: 4 | 6 | 9;
  constraints: ConsecutiveConstraints;
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

export default function ConsecutiveSudokuBoard({
  board,
  size,
  constraints,
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

  // Handle keyboard input for numbers
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!isInteractive || !onKeyDown) return;
    onKeyDown(e, row, col);
  };

  // Get inline styles for print/preview mode
  const getCellInlineStyle = (row: number, col: number) => {
    if (isPreview || isPrint) {
      return { backgroundColor: '#ffffff', color: '#000000' }; // bg-white equivalent for print
    }
    return {};
  };

  const getCellClassName = (row: number, col: number) => {
    let baseSize;
    if (isPrint) {
      // Match Classic Sudoku IsPrint sizes and fonts for 2-per-row layout on A4 paper
      baseSize = size === 9 ? 'w-[48px] h-[48px] text-[25px]' : size === 6 ? 'w-[70px] h-[70px] text-[35px]' : 'w-[100px] h-[100px] text-[45px]';
    } else if (isPreview) {
      // Preview Print with further increased font sizes: 9x9 (+30px total), 6x6 (+20px total), 4x4 (+10px total)
      baseSize = size === 9 ? 'w-8 h-8 text-[44px]' : size === 6 ? 'w-10 h-10 text-[36px]' : 'w-12 h-12 text-[28px]';
    } else if (isInteractive) {
      // Interactive game cells
      baseSize = size === 9 ? 'w-12 h-12 text-lg' : size === 6 ? 'w-16 h-16 text-xl' : 'w-20 h-20 text-2xl';
    } else {
      // Default size
      baseSize = size === 9 ? 'w-10 h-10 text-base' : size === 6 ? 'w-12 h-12 text-lg' : 'w-16 h-16 text-xl';
    }
    
    let className = `${baseSize} flex items-center justify-center font-bold select-none relative `;
    
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
      className += 'bg-white text-black ';
    } else if (isInteractive && originalBoard) {
      // Interactive game styling
      if (originalBoard[row][col] !== null) {
        // Original clues - white background
        className += 'bg-white dark:bg-white text-gray-800 dark:text-gray-800 ';
      } else {
        // User-entered cells
        if (errors?.has(`${row}-${col}`)) {
          // Error styling
          className += 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 ';
        } else {
          // Regular user input cells - blue text
          className += 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 ';
        }
      }
    } else {
      // Default styling - background colors handled by inline styles for print/preview
      if (!(isPreview || isPrint)) {
        className += 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ';
      }
    }
    
    // Focused cell styling for interactive mode - match Windoku style
    if (isInteractive && focusedCell && focusedCell[0] === row && focusedCell[1] === col) {
      className += 'ring-2 ring-blue-500 ring-inset ';
    }
    
    return className;
  };

  // Render consecutive constraint marks
  const renderConstraintMarks = (row: number, col: number) => {
    if (!constraints) return [];
    
    const marks = [];
    
    // Right constraint mark (horizontal)
    if (col < size - 1 && constraints.horizontal && constraints.horizontal[row] && constraints.horizontal[row][col]) {
      marks.push(
        <div
          key={`h-${row}-${col}`}
          className="absolute -right-[1px] top-1/2 transform -translate-y-1/2 w-[2px] h-[6px] bg-black z-10"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
          }}
        />
      );
    }
    
    // Bottom constraint mark (vertical)
    if (row < size - 1 && constraints.vertical && constraints.vertical[row] && constraints.vertical[row][col]) {
      marks.push(
        <div
          key={`v-${row}-${col}`}
          className="absolute -bottom-[1px] left-1/2 transform -translate-x-1/2 w-[6px] h-[2px] bg-black z-10"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
          }}
        />
      );
    }
    
    return marks;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {showTitle && title && (
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          {title}
        </h3>
      )}
      
      <div className="relative">
        <div className="grid gap-0 border-2 border-gray-600 bg-gray-600">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClassName(rowIndex, colIndex)}
                  style={getCellInlineStyle(rowIndex, colIndex)}
                  onClick={() => isInteractive && onCellClick?.(rowIndex, colIndex)}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                  tabIndex={isInteractive ? 0 : -1}
                  role={isInteractive ? "button" : undefined}
                  aria-label={isInteractive ? `Cell ${rowIndex + 1}, ${colIndex + 1}` : undefined}
                >
                  {getCellValue(rowIndex, colIndex)}
                  {renderConstraintMarks(rowIndex, colIndex)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
