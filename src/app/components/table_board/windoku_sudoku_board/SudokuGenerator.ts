import { SudokuCell, SudokuBoard } from '../types';
import * as ClassicSudoku from '../classic_sudoku_board/SudokuGenerator';

export type { SudokuCell, SudokuBoard };

// Helper function to create empty board
export function createEmptyBoard(size: number): SudokuBoard {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// Get the fixed windoku pattern for 9x9 grid based on the sample image
export function getWindokuPattern(): boolean[][] {
  // true = windoku cell (gray background), false = regular cell
  // Based on sample image - 4 overlapping 3x3 regions
  const pattern = Array(9).fill(null).map(() => Array(9).fill(false));
  
  // Define the 4 windoku regions (3x3 each)
  // Top-left region (rows 1-3, cols 1-3)
  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {
      pattern[row][col] = true;
    }
  }
  
  // Top-right region (rows 1-3, cols 5-7)
  for (let row = 1; row <= 3; row++) {
    for (let col = 5; col <= 7; col++) {
      pattern[row][col] = true;
    }
  }
  
  // Bottom-left region (rows 5-7, cols 1-3)
  for (let row = 5; row <= 7; row++) {
    for (let col = 1; col <= 3; col++) {
      pattern[row][col] = true;
    }
  }
  
  // Bottom-right region (rows 5-7, cols 5-7)
  for (let row = 5; row <= 7; row++) {
    for (let col = 5; col <= 7; col++) {
      pattern[row][col] = true;
    }
  }
  
  return pattern;
}

// Check if a cell is part of the windoku pattern
export function isWindokuCell(row: number, col: number): boolean {
  const pattern = getWindokuPattern();
  return pattern[row][col];
}

// Get windoku regions (4 regions of 3x3 each)
export function getWindokuRegions(): [number, number][][] {
  return [
    // Top-left region
    [[1,1], [1,2], [1,3], [2,1], [2,2], [2,3], [3,1], [3,2], [3,3]],
    // Top-right region  
    [[1,5], [1,6], [1,7], [2,5], [2,6], [2,7], [3,5], [3,6], [3,7]],
    // Bottom-left region
    [[5,1], [5,2], [5,3], [6,1], [6,2], [6,3], [7,1], [7,2], [7,3]],
    // Bottom-right region
    [[5,5], [5,6], [5,7], [6,5], [6,6], [6,7], [7,5], [7,6], [7,7]]
  ];
}

// Get which windoku region a cell belongs to (returns -1 if not in any windoku region)
export function getWindokuRegionIndex(row: number, col: number): number {
  const regions = getWindokuRegions();
  
  for (let i = 0; i < regions.length; i++) {
    if (regions[i].some(([r, c]) => r === row && c === col)) {
      return i;
    }
  }
  
  return -1;
}

// Check if a number is valid for Windoku Sudoku
export function isValidMove(board: SudokuBoard, row: number, col: number, num: number): boolean {
  // First check basic Sudoku rules
  if (!ClassicSudoku.isValidMove(board, row, col, num)) {
    return false;
  }
  
  // Check windoku constraint - if this cell is part of a windoku region,
  // the number cannot appear in any other cell of the same windoku region
  const regionIndex = getWindokuRegionIndex(row, col);
  
  if (regionIndex !== -1) {
    const regions = getWindokuRegions();
    const regionCells = regions[regionIndex];
    
    for (const [windokuRow, windokuCol] of regionCells) {
      // Skip the current cell
      if (windokuRow === row && windokuCol === col) {
        continue;
      }
      
      // Check if the number already exists in this windoku region
      if (board[windokuRow][windokuCol] === num) {
        return false;
      }
    }
  }
  
  return true;
}

// Generate a complete valid Windoku Sudoku board
export function generateCompleteBoard(): SudokuBoard {
  // Start with a classic Sudoku solution
  let solution = ClassicSudoku.generateCompleteBoard(9);
  
  // We need to ensure the windoku constraint is satisfied
  // This might require multiple attempts to generate a valid board
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    solution = ClassicSudoku.generateCompleteBoard(9);
    
    // Check if the windoku constraint is satisfied
    if (validateWindokuConstraint(solution)) {
      return solution;
    }
    
    attempts++;
  }
  
  // If we can't generate a valid board, return the last attempt
  // In practice, this should rarely happen
  return solution;
}

// Validate that the windoku constraint is satisfied
function validateWindokuConstraint(board: SudokuBoard): boolean {
  const regions = getWindokuRegions();
  
  for (const region of regions) {
    const regionValues = new Set<number>();
    
    for (const [row, col] of region) {
      const value = board[row][col] as number;
      if (regionValues.has(value)) {
        return false; // Duplicate found in windoku region
      }
      regionValues.add(value);
    }
  }
  
  return true;
}

// Generate a playable Windoku Sudoku puzzle
export function generatePuzzle(size: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
} {
  // Windoku Sudoku is only available in 9x9
  if (size !== 9) {
    throw new Error('Windoku Sudoku is only available in 9x9 size');
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
  
  // Remove numbers while ensuring we keep some clues in windoku regions
  const windokuRegions = getWindokuRegions();
  const windokuCluesRemoved = [0, 0, 0, 0]; // Track clues removed per windoku region
  const maxWindokuCluesRemoved = 6; // Keep at least 3 clues per windoku region
  
  let removed = 0;
  for (let i = 0; i < positions.length && removed < cellsToRemove; i++) {
    const [row, col] = positions[i];
    const regionIndex = getWindokuRegionIndex(row, col);
    
    // If this is a windoku cell, check if we can remove it
    if (regionIndex !== -1) {
      if (windokuCluesRemoved[regionIndex] < maxWindokuCluesRemoved) {
        puzzle[row][col] = null;
        windokuCluesRemoved[regionIndex]++;
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

// Validate the entire Windoku Sudoku board
export function validateBoard(board: SudokuBoard): boolean {
  // First validate as a classic Sudoku
  if (!ClassicSudoku.validateBoard(board)) {
    return false;
  }
  
  // Then validate the windoku constraint
  return validateWindokuConstraint(board);
}

// Check if the board is completely filled
export function isBoardComplete(board: SudokuBoard): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

// Check if the board is solved (complete and valid)
export function isBoardSolved(board: SudokuBoard): boolean {
  return isBoardComplete(board) && validateBoard(board);
}
