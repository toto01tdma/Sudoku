'use client';

import React from 'react';
import { SudokuBoard as SudokuBoardType } from '../types';
import { JigsawRegions } from './SudokuGenerator';

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
  jigsawRegions?: JigsawRegions;
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
  onKeyDown,
  jigsawRegions
}: SudokuBoardProps) {
  
  const getCellValue = (row: number, col: number) => {
    const value = board[row][col];
    return value || '';
  };

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!isInteractive || !onKeyDown) return;
    
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      // If it's a number key and this is an editable cell
      if (originalBoard && originalBoard[row][col] === null && /^[1-9]$/.test(e.key)) {
        const numValue = parseInt(e.key, 10);
        if (numValue >= 1 && numValue <= size) {
          onKeyDown(e, row, col);
        }
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
      baseSize = size === 9 ? 'w-[48px] h-[48px] text-[25px]' : 'w-[70px] h-[70px] text-[35px]'; // 9x9 or 6x6
    } else if (isPreview) {
      baseSize = size === 9 ? 'w-8 h-8 text-[44px]' : 'w-10 h-10 text-[36px]'; // 9x9 or 6x6
    } else if (isInteractive) {
      baseSize = size === 9 ? 'w-12 h-12 text-lg' : 'w-16 h-16 text-xl'; // 9x9 or 6x6
    } else {
      baseSize = size === 9 ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'; // 9x9 or 6x6
    }

    let className = `${baseSize} text-center font-bold flex items-center justify-center `;
    
    if (isInteractive) {
      className += 'border border-gray-400 focus:outline-none cursor-pointer ';
    } else if (isPreview || isPrint) {
      className += 'border border-gray-400 ';
    } else {
      className += 'outline outline-1 outline-gray-400 ';
    }

    // Add jigsaw region borders
    if (jigsawRegions) {
      const currentRegion = jigsawRegions.regions[row][col];
      
      // Check adjacent cells for region boundaries
      const topRegion = row > 0 ? jigsawRegions.regions[row - 1][col] : -1;
      const bottomRegion = row < size - 1 ? jigsawRegions.regions[row + 1][col] : -1;
      const leftRegion = col > 0 ? jigsawRegions.regions[row][col - 1] : -1;
      const rightRegion = col < size - 1 ? jigsawRegions.regions[row][col + 1] : -1;
      
      // Add thick borders where regions differ
      if (topRegion !== currentRegion) {
        className += 'border-t-2 border-t-gray-600 ';
      }
      if (bottomRegion !== currentRegion) {
        className += 'border-b-2 border-b-gray-600 ';
      }
      if (leftRegion !== currentRegion) {
        className += 'border-l-2 border-l-gray-600 ';
      }
      if (rightRegion !== currentRegion) {
        className += 'border-r-2 border-r-gray-600 ';
      }
    }

    // Background colors based on cell type
    if (isInteractive && originalBoard) {
      if (originalBoard[row][col] !== null) {
        // Initial numbers
        className += 'bg-white dark:bg-white text-gray-800 dark:text-gray-800 ';
      } else {
        // User input cells
        className += 'bg-white dark:bg-white ';
        
        // User entered numbers are blue
        if (board[row][col] !== null) {
          className += 'text-blue-600 dark:text-blue-400 ';
        } else {
          className += 'text-gray-500 dark:text-gray-400 ';
        }
      }
    } else {
      // Non-interactive mode (print/preview)
      className += 'bg-white dark:bg-white text-gray-800 dark:text-gray-800 ';
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
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
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
      
      {/* Jigsaw Sudoku Legend */}
      {showTitle && !isPrint && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Jigsaw Sudoku: Numbers must not repeat in rows, columns, or irregular regions (bold borders)
          </p>
        </div>
      )}
    </div>
  );
}
