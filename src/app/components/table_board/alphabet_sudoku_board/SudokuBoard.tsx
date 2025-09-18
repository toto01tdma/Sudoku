'use client';

import React from 'react';
import { SudokuBoard as SudokuBoardType } from '../types';
import { getLettersForSize } from './SudokuGenerator';

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

  // Handle keyboard input for letters
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!isInteractive || !onKeyDown) return;
    
    const validLetters = getLettersForSize(size);
    
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      // Handle letter input (A-Z) - pass the letter directly
      if (originalBoard && originalBoard[row][col] === null && /^[A-Za-z]$/.test(e.key)) {
        const letter = e.key.toUpperCase();
        if (validLetters.includes(letter)) {
          // Create a synthetic event with the letter
          const syntheticEvent = {
            ...e,
            key: letter
          } as React.KeyboardEvent;
          onKeyDown(syntheticEvent, row, col);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Handle deletion for editable cells
        if (originalBoard && originalBoard[row][col] === null) {
          onKeyDown(e, row, col);
        }
      }
      return;
    }
    
    // Handle arrow key navigation
    onKeyDown(e, row, col);
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
      baseSize = size === 9 ? 'w-12 h-12 text-lg' : size === 6 ? 'w-16 h-16 text-xl' : 'w-20 h-20 text-2xl';
    } else {
      baseSize = size === 9 ? 'w-10 h-10 text-base' : size === 6 ? 'w-12 h-12 text-lg' : 'w-16 h-16 text-xl';
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
          // Regular user input cells - blue for user input
          className += 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 ';
        }
      }
    } else {
      // Default styling
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
              onKeyDown={isInteractive ? (e) => handleKeyDown(e, rowIndex, colIndex) : undefined}
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
      
      {/* Alphabet Sudoku Legend */}
      {showTitle && !isPrint && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Alphabet Sudoku: Use letters {getLettersForSize(size).join(', ')} - each must appear once per row, column, and box
          </p>
          {isInteractive && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Type letters A-{getLettersForSize(size)[size-1]} to fill cells
            </p>
          )}
        </div>
      )}
    </div>
  );
}
