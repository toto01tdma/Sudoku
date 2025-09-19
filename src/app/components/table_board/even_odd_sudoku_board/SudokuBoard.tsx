'use client';

import React from 'react';
import { SudokuBoard as SudokuBoardType } from '../types';

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
  evenOddPattern?: boolean[][]; // New prop for even-odd pattern
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
  evenOddPattern
}: SudokuBoardProps) {
  
  const getCellValue = (row: number, col: number) => {
    const value = board[row][col];
    return value || '';
  };

  // Handle keyboard input with even-odd validation
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!isInteractive || !onKeyDown) return;
    
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      // If it's a number key and this is an editable cell, validate even-odd constraint
      if (originalBoard && originalBoard[row][col] === null && /^[1-9]$/.test(e.key)) {
        const numValue = parseInt(e.key, 10);
        
        // Check even-odd constraint if pattern is available
        if (evenOddPattern) {
          const shouldBeEven = evenOddPattern[row][col];
          const isEven = numValue % 2 === 0;
          
          if (shouldBeEven !== isEven) {
            // Invalid move - number doesn't match even-odd requirement
            return;
          }
        }
        
        // If valid, pass to parent handler
        onKeyDown(e, row, col);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        onKeyDown(e, row, col);
      }
      return;
    }
    
    // Handle arrow keys for navigation
    onKeyDown(e, row, col);
  };

  // Get inline styles for print/preview mode
  const getCellInlineStyle = (row: number, col: number) => {
    if (isPreview || isPrint) {
      const cellValue = board[row][col];
      if (cellValue !== null) {
        const isEvenNumber = (cellValue as number) % 2 === 0;
        if (isEvenNumber) {
          return { backgroundColor: '#e5e7eb', color: '#000000' }; // bg-gray-200 equivalent
        } else {
          return { backgroundColor: '#ffffff', color: '#000000' }; // bg-white equivalent
        }
      } else {
        // Empty cells: check pattern for background
        if (evenOddPattern && evenOddPattern[row][col]) {
          return { backgroundColor: '#e5e7eb', color: '#000000' }; // bg-gray-200 equivalent
        } else {
          return { backgroundColor: '#ffffff', color: '#000000' }; // bg-white equivalent
        }
      }
    }
    return {};
  };

  const getCellClassName = (row: number, col: number) => {
    let baseSize;
    if (isPrint) {
      baseSize = size === 9 ? 'w-[48px] h-[48px] text-[25px]' : size === 6 ? 'w-[70px] h-[70px] text-[35px]' : 'w-[100px] h-[100px] text-[45px]';
    } else if (isPreview) {
      baseSize = size === 9 ? 'w-8 h-8 text-[44px]' : size === 6 ? 'w-10 h-10 text-[36px]' : 'w-12 h-12 text-[28px]';
    } else if (isInteractive) {
      baseSize = size === 9 ? 'w-12 h-12 text-lg' : size === 6 ? 'w-16 h-16 text-xl' : 'w-20 h-20 text-2xl';
    } else {
      baseSize = size === 9 ? 'w-10 h-10 text-base' : size === 6 ? 'w-12 h-12 text-lg' : 'w-16 h-16 text-xl';
    }

    let className = `${baseSize} text-center font-bold flex items-center justify-center `;
    
    if (isInteractive) {
      className += 'border border-gray-400 focus:outline-none cursor-pointer ';
    } else if (isPreview || isPrint) {
      className += 'border border-gray-400 ';
    } else {
      className += 'outline outline-1 outline-gray-400 ';
    }

    // Background colors based on cell type and even-odd pattern
    if (isInteractive && originalBoard) {
      if (originalBoard[row][col] !== null) {
        // Initial numbers: check if the number is even
        const cellValue = originalBoard[row][col] as number;
        const isEvenNumber = cellValue % 2 === 0;
        if (isEvenNumber) {
          className += 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 '; // Gray background for even initial numbers
        } else {
          className += 'bg-white dark:bg-white text-gray-800 dark:text-gray-800 '; // White background for odd initial numbers
        }
      } else {
        // User input cells: check if this cell should contain even numbers (from pattern)
        if (evenOddPattern && evenOddPattern[row][col]) {
          className += 'bg-gray-200 dark:bg-gray-700 '; // Gray background for cells that should contain even numbers
        } else {
          className += 'bg-white dark:bg-white '; // White background for cells that should contain odd numbers
        }
        
        // User entered numbers are blue
        if (board[row][col] !== null) {
          className += 'text-blue-600 dark:text-blue-400 ';
        } else {
          className += 'text-gray-500 dark:text-gray-400 ';
        }
      }
    } else {
      // Non-interactive mode (print/preview) - background colors handled by inline styles
      if (!(isPreview || isPrint)) {
        const cellValue = board[row][col];
        if (cellValue !== null) {
          const isEvenNumber = (cellValue as number) % 2 === 0;
          if (isEvenNumber) {
            className += 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ';
          } else {
            className += 'bg-white dark:bg-white text-gray-800 dark:text-gray-800 ';
          }
        } else {
          // Empty cells: check pattern for background
          if (evenOddPattern && evenOddPattern[row][col]) {
            className += 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 ';
          } else {
            className += 'bg-white dark:bg-white text-gray-500 dark:text-gray-400 ';
          }
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

  const getGridStyle = () => {
    if (size === 9) {
      return {
        gridTemplateColumns: 'repeat(9, 1fr)',
        gridTemplateRows: 'repeat(9, 1fr)',
      };
    } else if (size === 6) {
      return {
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)',
      };
    } else {
      return {
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
      };
    }
  };

  const getBorderStyle = (row: number, col: number) => {
    let borderClass = '';
    
    if (size === 9) {
      // 3x3 boxes
      if (row % 3 === 2 && row < 8) borderClass += 'border-b-2 border-b-gray-600 ';
      if (col % 3 === 2 && col < 8) borderClass += 'border-r-2 border-r-gray-600 ';
    } else if (size === 6) {
      // 2x3 boxes
      if (row % 2 === 1 && row < 5) borderClass += 'border-b-2 border-b-gray-600 ';
      if (col % 3 === 2 && col < 5) borderClass += 'border-r-2 border-r-gray-600 ';
    } else {
      // 2x2 boxes
      if (row % 2 === 1 && row < 3) borderClass += 'border-b-2 border-b-gray-600 ';
      if (col % 2 === 1 && col < 3) borderClass += 'border-r-2 border-r-gray-600 ';
    }
    
    return borderClass;
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
        style={getGridStyle()}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${getCellClassName(rowIndex, colIndex)} ${getBorderStyle(rowIndex, colIndex)}`}
              style={getCellInlineStyle(rowIndex, colIndex)}
              onClick={() => isInteractive && onCellClick && onCellClick(rowIndex, colIndex)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
              tabIndex={isInteractive ? 0 : -1}
            >
              {getCellValue(rowIndex, colIndex)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}