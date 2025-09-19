import { SudokuCell, SudokuBoard } from '../types';
import * as ClassicSudoku from '../classic_sudoku_board/SudokuGenerator';

export type { SudokuCell, SudokuBoard };

// Helper function to create empty board
export function createEmptyBoard(size: number): SudokuBoard {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// Get the fixed asterisk pattern for 9x9 grid based on the provided positions
export function getAsteriskPattern(): boolean[][] {
  const pattern = Array(9).fill(null).map(() => Array(9).fill(false));
  
  // Set the specific positions to true
  const asteriskPositions = [
    [1, 4], [2, 6], [4, 7], [6, 6], [7, 4], 
    [6, 2], [4, 1], [2, 2], [4, 4]
  ];
  
  for (const [row, col] of asteriskPositions) {
    pattern[row][col] = true;
  }
  
  return pattern;
}

// Check if a cell is part of the asterisk pattern
export function isAsteriskCell(row: number, col: number): boolean {
  const pattern = getAsteriskPattern();
  return pattern[row][col];
}

// Get all asterisk cells coordinates
export function getAsteriskCells(): [number, number][] {
  const cells: [number, number][] = [];
  const pattern = getAsteriskPattern();
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (pattern[row][col]) {
        cells.push([row, col]);
      }
    }
  }
  
  return cells;
}

// Check if a number is valid for Asterisk Sudoku
export function isValidMove(board: SudokuBoard, row: number, col: number, num: number): boolean {
  // First check basic Sudoku rules
  if (!ClassicSudoku.isValidMove(board, row, col, num)) {
    return false;
  }
  
  // Check asterisk constraint - if this cell is part of the asterisk,
  // the number cannot appear in any other asterisk cell
  if (isAsteriskCell(row, col)) {
    const asteriskCells = getAsteriskCells();
    
    for (const [asteriskRow, asteriskCol] of asteriskCells) {
      // Skip the current cell
      if (asteriskRow === row && asteriskCol === col) {
        continue;
      }
      
      // Check if the number already exists in another asterisk cell
      if (board[asteriskRow][asteriskCol] === num) {
        return false;
      }
    }
  }
  
  return true;
}

// Generate a complete valid Asterisk Sudoku board
export function generateCompleteBoard(): SudokuBoard {
  // Start with a classic Sudoku solution
  let solution = ClassicSudoku.generateCompleteBoard(9);
  
  // We need to ensure the asterisk constraint is satisfied
  // This might require multiple attempts to generate a valid board
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    solution = ClassicSudoku.generateCompleteBoard(9);
    
    // Check if the asterisk constraint is satisfied
    if (validateAsteriskConstraint(solution)) {
      return solution;
    }
    
    attempts++;
  }
  
  // If we can't generate a valid board, return the last attempt
  // In practice, this should rarely happen
  return solution;
}

// Validate that the asterisk constraint is satisfied
function validateAsteriskConstraint(board: SudokuBoard): boolean {
  const asteriskCells = getAsteriskCells();
  const asteriskValues = new Set<number>();
  
  for (const [row, col] of asteriskCells) {
    const value = board[row][col] as number;
    if (asteriskValues.has(value)) {
      return false; // Duplicate found in asterisk cells
    }
    asteriskValues.add(value);
  }
  
  return true;
}

// Generate a playable Asterisk Sudoku puzzle
export function generatePuzzle(size: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
} {
  // Asterisk Sudoku is only available in 9x9
  if (size !== 9) {
    throw new Error('Asterisk Sudoku is only available in 9x9 size');
  }
  
  const solution = generateCompleteBoard();
  const puzzle = solution.map(row => [...row]);
  
  // Remove numbers based on difficulty
  let cellsToRemove;
  const totalCells = 81; // 9x9 = 81
  
  switch (difficulty) {
    case 'easy':
      cellsToRemove = Math.floor(totalCells * 0.4); // Remove 40%
      break;
    case 'medium':
      cellsToRemove = Math.floor(totalCells * 0.5); // Remove 50%
      break;
    case 'hard':
      cellsToRemove = Math.floor(totalCells * 0.6); // Remove 60%
      break;
  }
  
  const positions = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col]);
    }
  }
  
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Remove numbers while ensuring we keep some clues in asterisk cells
  const asteriskCells = getAsteriskCells();
  let asteriskCluesRemoved = 0;
  const maxAsteriskCluesRemoved = Math.floor(asteriskCells.length * 0.6); // Keep at least 40% of asterisk clues
  
  let removed = 0;
  for (let i = 0; i < positions.length && removed < cellsToRemove; i++) {
    const [row, col] = positions[i];
    
    // If this is an asterisk cell, check if we can remove it
    if (isAsteriskCell(row, col)) {
      if (asteriskCluesRemoved < maxAsteriskCluesRemoved) {
        puzzle[row][col] = null;
        asteriskCluesRemoved++;
        removed++;
      }
    } else {
      // Regular cell, can remove freely
      puzzle[row][col] = null;
      removed++;
    }
  }
  
  return { puzzle, solution };
}

// Validate the entire Asterisk Sudoku board
export function validateBoard(board: SudokuBoard): boolean {
  // First validate as a classic Sudoku
  if (!ClassicSudoku.validateBoard(board)) {
    return false;
  }
  
  // Then validate the asterisk constraint
  return validateAsteriskConstraint(board);
}

// Check if the board is completely filled
export function isBoardComplete(board: SudokuBoard): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

// Check if the board is solved (complete and valid)
export function isBoardSolved(board: SudokuBoard): boolean {
  return isBoardComplete(board) && validateBoard(board);
}
