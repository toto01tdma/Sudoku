import { SudokuCell, SudokuBoard } from '../types';

export type { SudokuCell, SudokuBoard };

// Helper function to create empty board
export function createEmptyBoard(size: number): SudokuBoard {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// Helper function to get the box/subgrid coordinates
export function getBoxCoordinates(row: number, col: number, size: number): [number, number] {
  let boxSize: number;
  if (size === 4) boxSize = 2;
  else if (size === 6) boxSize = 2; // 6x6 uses 2x3 boxes
  else boxSize = 3; // 9x9 uses 3x3 boxes
  
  if (size === 6) {
    // For 6x6, we have 2x3 boxes
    const boxRow = Math.floor(row / 2);
    const boxCol = Math.floor(col / 3);
    return [boxRow, boxCol];
  } else {
    const boxRow = Math.floor(row / boxSize);
    const boxCol = Math.floor(col / boxSize);
    return [boxRow, boxCol];
  }
}

// Check if a number is valid in a specific position
export function isValidMove(board: SudokuBoard, row: number, col: number, num: number): boolean {
  const size = board.length;
  
  // Check row
  for (let c = 0; c < size; c++) {
    if (c !== col && board[row][c] === num) {
      return false;
    }
  }
  
  // Check column
  for (let r = 0; r < size; r++) {
    if (r !== row && board[r][col] === num) {
      return false;
    }
  }
  
  // Check box/subgrid
  let boxRowSize, boxColSize;
  if (size === 4) {
    boxRowSize = boxColSize = 2;
  } else if (size === 6) {
    boxRowSize = 2;
    boxColSize = 3;
  } else {
    boxRowSize = boxColSize = 3;
  }
  
  const startRow = Math.floor(row / boxRowSize) * boxRowSize;
  const startCol = Math.floor(col / boxColSize) * boxColSize;
  
  for (let r = startRow; r < startRow + boxRowSize; r++) {
    for (let c = startCol; c < startCol + boxColSize; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) {
        return false;
      }
    }
  }
  
  return true;
}

// Simple Sudoku solver using backtracking
export function solveSudoku(board: SudokuBoard): boolean {
  const size = board.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === null) {
        for (let num = 1; num <= size; num++) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num;
            
            if (solveSudoku(board)) {
              return true;
            }
            
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Generate a complete valid Sudoku board
export function generateCompleteBoard(size: number): SudokuBoard {
  const board = createEmptyBoard(size);
  
  // Use backtracking to generate a complete valid board
  // Add some random seeding to make each board different
  const numbers = Array.from({ length: size }, (_, i) => i + 1);
  
  // Shuffle the first row to add randomness
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  // Fill the first row with shuffled numbers
  for (let col = 0; col < size; col++) {
    board[0][col] = numbers[col];
  }
  
  // Fill remaining cells using backtracking
  solveSudoku(board);
  
  return board;
}

// Generate a playable Sudoku puzzle by removing numbers from a complete board
export function generatePuzzle(size: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
} {
  const solution = generateCompleteBoard(size);
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
  
  return { puzzle, solution };
}

// Validate the entire board
export function validateBoard(board: SudokuBoard): boolean {
  const size = board.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      if (cell !== null) {
        // Temporarily remove the cell value and check if it's valid
        const temp = board[row][col] as number;
        board[row][col] = null;
        const isValid = isValidMove(board, row, col, temp);
        board[row][col] = temp;
        
        if (!isValid) {
          return false;
        }
      }
    }
  }
  
  return true;
}

// Check if the board is completely filled
export function isBoardComplete(board: SudokuBoard): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

// Check if the board is solved (complete and valid)
export function isBoardSolved(board: SudokuBoard): boolean {
  return isBoardComplete(board) && validateBoard(board);
}
