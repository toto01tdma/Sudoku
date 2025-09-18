import { SudokuCell, SudokuBoard } from '../types';

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

// Generate random consecutive constraints for the board
export function generateConsecutiveConstraints(size: number): ConsecutiveConstraints {
  const horizontal: boolean[][] = Array(size).fill(null).map(() => Array(size - 1).fill(false));
  const vertical: boolean[][] = Array(size - 1).fill(null).map(() => Array(size).fill(false));
  
  // Add some random consecutive constraints (about 20-30% of possible positions)
  const constraintProbability = 0.25;
  
  // Horizontal constraints
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size - 1; col++) {
      if (Math.random() < constraintProbability) {
        horizontal[row][col] = true;
      }
    }
  }
  
  // Vertical constraints
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size; col++) {
      if (Math.random() < constraintProbability) {
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
  constraints: ConsecutiveConstraints
): boolean {
  const size = board.length;
  
  // Check if number is in valid range
  if (num < 1 || num > size) {
    return false;
  }
  
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
  const [boxRow, boxCol] = getBoxCoordinates(row, col, size);
  
  if (size === 6) {
    // 6x6 grid has 2x3 boxes
    const startRow = boxRow * 2;
    const startCol = boxCol * 3;
    for (let r = startRow; r < startRow + 2; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if ((r !== row || c !== col) && board[r][c] === num) {
          return false;
        }
      }
    }
  } else {
    // 4x4 and 9x9 grids
    const boxSize = size === 4 ? 2 : 3;
    const startRow = boxRow * boxSize;
    const startCol = boxCol * boxSize;
    for (let r = startRow; r < startRow + boxSize; r++) {
      for (let c = startCol; c < startCol + boxSize; c++) {
        if ((r !== row || c !== col) && board[r][c] === num) {
          return false;
        }
      }
    }
  }
  
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

// Generate a complete valid Consecutive Sudoku board using backtracking
export function generateCompleteBoard(size: number, constraints: ConsecutiveConstraints): SudokuBoard {
  const board = createEmptyBoard(size);
  
  function fillBoard(): boolean {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === null) {
          // Try numbers 1 to size in random order
          const numbers = Array.from({ length: size }, (_, i) => i + 1);
          numbers.sort(() => Math.random() - 0.5);
          
          for (const num of numbers) {
            if (isValidMove(board, row, col, num, constraints)) {
              board[row][col] = num;
              
              if (fillBoard()) {
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
  
  fillBoard();
  return board;
}

// Generate a Consecutive Sudoku puzzle by removing numbers from a complete board
export function generatePuzzle(size: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
  constraints: ConsecutiveConstraints;
} {
  // Generate constraints first
  const constraints = generateConsecutiveConstraints(size);
  
  // Generate solution with these constraints
  const solution = generateCompleteBoard(size, constraints);
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
  positions.sort(() => Math.random() - 0.5);
  
  let removedCount = 0;
  for (let i = 0; i < positions.length && removedCount < cellsToRemove; i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = null;
    removedCount++;
  }
  
  return { puzzle, solution, constraints };
}

// Validate the entire Consecutive Sudoku board
export function validateBoard(board: SudokuBoard, constraints: ConsecutiveConstraints): boolean {
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
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}

// Check if the board is solved (complete and valid)
export function isBoardSolved(board: SudokuBoard, constraints: ConsecutiveConstraints): boolean {
  return isBoardComplete(board) && validateBoard(board, constraints);
}
