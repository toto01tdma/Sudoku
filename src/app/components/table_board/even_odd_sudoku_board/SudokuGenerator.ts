import { SudokuCell, SudokuBoard } from '../types';

export type { SudokuCell, SudokuBoard };

// Helper function to create empty board
export function createEmptyBoard(size: number): SudokuBoard {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// Define the even-odd pattern for a 9x9 grid based on the image provided
// true = shaded cell (even numbers only), false = unshaded cell (odd numbers only)
export function getEvenOddPattern(size: number): boolean[][] {
  if (size === 9) {
    // Pattern based on the provided image
    return [
      [false, false, false, false, false, true,  false, false, false],
      [false, false, true,  true,  false, false, false, false, true ],
      [false, false, true,  false, true,  false, true,  false, false],
      [true,  false, false, false, false, false, false, false, false],
      [true,  false, false, false, false, true,  false, false, true ],
      [false, false, false, true,  false, false, false, true,  true ],
      [true,  true,  false, false, false, true,  false, false, false],
      [true,  true,  false, false, true,  false, false, false, false],
      [false, false, false, false, true,  true,  true,  false, false]
    ];
  } else if (size === 6) {
    // Simple checkerboard-like pattern for 6x6
    return [
      [false, true,  false, true,  false, true ],
      [true,  false, true,  false, true,  false],
      [false, true,  false, true,  false, true ],
      [true,  false, true,  false, true,  false],
      [false, true,  false, true,  false, true ],
      [true,  false, true,  false, true,  false]
    ];
  } else if (size === 4) {
    // Simple pattern for 4x4
    return [
      [false, true,  false, true ],
      [true,  false, true,  false],
      [false, true,  false, true ],
      [true,  false, true,  false]
    ];
  }
  
  // Fallback: all cells allow any number
  return Array(size).fill(null).map(() => Array(size).fill(false));
}

// Check if a cell should contain even numbers (shaded) or odd numbers (unshaded)
export function isShadedCell(row: number, col: number, size: number): boolean {
  const pattern = getEvenOddPattern(size);
  return pattern[row][col];
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

// Check if a number is valid in a specific position for Even-Odd Sudoku
export function isValidMove(board: SudokuBoard, row: number, col: number, num: number): boolean {
  const size = board.length;
  
  // Check even-odd constraint first
  const isShaded = isShadedCell(row, col, size);
  const isEven = num % 2 === 0;
  
  if (isShaded && !isEven) {
    return false; // Shaded cell must contain even number
  }
  if (!isShaded && isEven) {
    return false; // Unshaded cell must contain odd number
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

// Simple Even-Odd Sudoku solver using backtracking
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

// Generate a complete valid Even-Odd Sudoku board
export function generateCompleteBoard(size: number): SudokuBoard {
  const board = createEmptyBoard(size);
  
  // For Even-Odd Sudoku, we need to be more careful about initial placement
  // Start with a strategic approach to ensure solvability
  
  // Try multiple times to generate a valid board
  for (let attempt = 0; attempt < 10; attempt++) {
    // Reset board
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        board[row][col] = null;
      }
    }
    
    // Try to fill the board using backtracking
    if (solveSudoku(board)) {
      return board;
    }
  }
  
  // If we can't generate a valid board, return empty board
  // This shouldn't happen with proper constraints
  return board;
}

// Generate a playable Even-Odd Sudoku puzzle by removing numbers from a complete board
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

// Validate the entire Even-Odd Sudoku board
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

// Helper function to get valid numbers for a specific cell
export function getValidNumbersForCell(row: number, col: number, size: number): number[] {
  const isShaded = isShadedCell(row, col, size);
  const allNumbers = Array.from({ length: size }, (_, i) => i + 1);
  
  if (isShaded) {
    // Shaded cell: only even numbers
    return allNumbers.filter(num => num % 2 === 0);
  } else {
    // Unshaded cell: only odd numbers
    return allNumbers.filter(num => num % 2 === 1);
  }
}
