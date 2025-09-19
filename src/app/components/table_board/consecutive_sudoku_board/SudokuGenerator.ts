import { SudokuCell, SudokuBoard } from '../types';
import * as ClassicSudoku from '../classic_sudoku_board/SudokuGenerator';

export type { SudokuCell, SudokuBoard };

// Type for consecutive constraints - stores which cell pairs must be consecutive
export interface ConsecutiveConstraints {
  horizontal: boolean[][]; // horizontal[row][col] = true if there's a mark between (row,col) and (row,col+1)
  vertical: boolean[][]; // vertical[row][col] = true if there's a mark between (row,col) and (row+1,col)
}

// Helper function to create empty board
export function createEmptyBoard(size: number): SudokuBoard {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// Generate consecutive constraints based on the solution board
export function generateConsecutiveConstraints(solution: SudokuBoard): ConsecutiveConstraints {
  const size = solution.length;
  const horizontal: boolean[][] = Array(size).fill(null).map(() => Array(size - 1).fill(false));
  const vertical: boolean[][] = Array(size - 1).fill(null).map(() => Array(size).fill(false));
  
  // Probability of adding a consecutive mark where numbers are actually consecutive
  const markProbability = 0.6; // 60% chance to mark actual consecutive pairs
  
  // Also add some random marks where numbers are consecutive
  const randomMarkProbability = 0.2; // 20% chance to add random consecutive marks
  
  // Check horizontal pairs
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size - 1; col++) {
      const leftValue = solution[row][col] as number;
      const rightValue = solution[row][col + 1] as number;
      const isConsecutive = Math.abs(leftValue - rightValue) === 1;
      
      if (isConsecutive && Math.random() < markProbability) {
        horizontal[row][col] = true;
      } else if (!isConsecutive && Math.random() < randomMarkProbability) {
        // Occasionally add marks between non-consecutive numbers for puzzle variety
        // But we need to ensure this doesn't make the puzzle unsolvable
        // For now, let's only mark actual consecutive pairs
      }
    }
  }
  
  // Check vertical pairs
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size; col++) {
      const topValue = solution[row][col] as number;
      const bottomValue = solution[row + 1][col] as number;
      const isConsecutive = Math.abs(topValue - bottomValue) === 1;
      
      if (isConsecutive && Math.random() < markProbability) {
        vertical[row][col] = true;
      }
    }
  }
  
  return { horizontal, vertical };
}

// Check if a number is valid in a specific position for Consecutive Sudoku
export function isValidMove(
  board: SudokuBoard, 
  row: number, 
  col: number, 
  num: number, 
  constraints?: ConsecutiveConstraints
): boolean {
  // First check basic Sudoku rules
  if (!ClassicSudoku.isValidMove(board, row, col, num)) {
    return false;
  }
  
  // If no constraints provided, just use classic validation
  if (!constraints) {
    return true;
  }
  
  const size = board.length;
  
  // Check consecutive constraints
  
  // Check left neighbor
  if (col > 0 && board[row][col - 1] !== null) {
    const leftValue = board[row][col - 1] as number;
    const hasConstraint = constraints.horizontal[row][col - 1];
    const isConsecutive = Math.abs(leftValue - num) === 1;
    
    if (hasConstraint && !isConsecutive) {
      return false; // Must be consecutive but isn't
    }
    if (!hasConstraint && isConsecutive) {
      return false; // Must not be consecutive but is
    }
  }
  
  // Check right neighbor
  if (col < size - 1 && board[row][col + 1] !== null) {
    const rightValue = board[row][col + 1] as number;
    const hasConstraint = constraints.horizontal[row][col];
    const isConsecutive = Math.abs(rightValue - num) === 1;
    
    if (hasConstraint && !isConsecutive) {
      return false; // Must be consecutive but isn't
    }
    if (!hasConstraint && isConsecutive) {
      return false; // Must not be consecutive but is
    }
  }
  
  // Check top neighbor
  if (row > 0 && board[row - 1][col] !== null) {
    const topValue = board[row - 1][col] as number;
    const hasConstraint = constraints.vertical[row - 1][col];
    const isConsecutive = Math.abs(topValue - num) === 1;
    
    if (hasConstraint && !isConsecutive) {
      return false; // Must be consecutive but isn't
    }
    if (!hasConstraint && isConsecutive) {
      return false; // Must not be consecutive but is
    }
  }
  
  // Check bottom neighbor
  if (row < size - 1 && board[row + 1][col] !== null) {
    const bottomValue = board[row + 1][col] as number;
    const hasConstraint = constraints.vertical[row][col];
    const isConsecutive = Math.abs(bottomValue - num) === 1;
    
    if (hasConstraint && !isConsecutive) {
      return false; // Must be consecutive but isn't
    }
    if (!hasConstraint && isConsecutive) {
      return false; // Must not be consecutive but is
    }
  }
  
  return true;
}

// Generate a playable Consecutive Sudoku puzzle
export function generatePuzzle(size: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
  constraints: ConsecutiveConstraints;
} {
  // First generate a classic Sudoku solution
  const solution = ClassicSudoku.generateCompleteBoard(size);
  
  // Generate consecutive constraints based on the solution
  const constraints = generateConsecutiveConstraints(solution);
  
  // Create puzzle by removing numbers (same as classic Sudoku)
  const puzzle = solution.map(row => [...row]);
  
  // Remove numbers based on difficulty
  let cellsToRemove;
  const totalCells = size * size;
  
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
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      positions.push([row, col]);
    }
  }
  
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Remove numbers
  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = null;
  }
  
  return { puzzle, solution, constraints };
}

// Validate the entire Consecutive Sudoku board
export function validateBoard(board: SudokuBoard, constraints?: ConsecutiveConstraints): boolean {
  const size = board.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      if (cell !== null) {
        // Temporarily remove the cell value and check if it's valid
        const temp = board[row][col] as number;
        board[row][col] = null;
        const isValid = isValidMove(board, row, col, temp, constraints);
        board[row][col] = temp;
        
        if (!isValid) {
          return false;
        }
      }
    }
  }
  
  return true;
}

// Check if the board is complete (no empty cells)
export function isBoardComplete(board: SudokuBoard): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

// Check if the board is solved (complete and valid)
export function isBoardSolved(board: SudokuBoard, constraints?: ConsecutiveConstraints): boolean {
  return isBoardComplete(board) && validateBoard(board, constraints);
}
