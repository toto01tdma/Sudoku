import { SudokuCell, SudokuBoard } from '../types';

export type { SudokuCell, SudokuBoard };

// Helper function to create empty board
export function createEmptyBoard(size: number): SudokuBoard {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// Get the Thai characters to use based on board size
export function getThaiCharactersForSize(size: number): string[] {
  if (size === 4) {
    return ['ก', 'ข', 'ค', 'ง'];
  } else if (size === 6) {
    return ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ'];
  } else if (size === 9) {
    return ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ'];
  }
  
  // Fallback for other sizes (shouldn't happen)
  const thaiChars = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ'];
  return thaiChars.slice(0, size);
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

// Check if a Thai character is valid in a specific position
export function isValidMove(board: SudokuBoard, row: number, col: number, char: string): boolean {
  const size = board.length;
  const validChars = getThaiCharactersForSize(size);
  
  // Check if the character is valid for this board size
  if (!validChars.includes(char)) {
    return false;
  }
  
  // Check row
  for (let c = 0; c < size; c++) {
    if (c !== col && board[row][c] === char) {
      return false;
    }
  }
  
  // Check column
  for (let r = 0; r < size; r++) {
    if (r !== row && board[r][col] === char) {
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
        if ((r !== row || c !== col) && board[r][c] === char) {
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
        if ((r !== row || c !== col) && board[r][c] === char) {
          return false;
        }
      }
    }
  }
  
  return true;
}

// Generate a complete valid Thai Alphabet Sudoku board using backtracking
export function generateCompleteBoard(size: number): SudokuBoard {
  const board = createEmptyBoard(size);
  const chars = getThaiCharactersForSize(size);
  
  function fillBoard(): boolean {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === null) {
          // Shuffle characters for randomness
          const shuffledChars = [...chars].sort(() => Math.random() - 0.5);
          
          for (const char of shuffledChars) {
            if (isValidMove(board, row, col, char)) {
              board[row][col] = char;
              
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

// Generate a Thai Alphabet Sudoku puzzle by removing characters from a complete board
export function generatePuzzle(size: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
} {
  const solution = generateCompleteBoard(size);
  const puzzle = solution.map(row => [...row]);
  
  // Remove characters based on difficulty
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
  
  return { puzzle, solution };
}

// Validate the entire Thai Alphabet Sudoku board
export function validateBoard(board: SudokuBoard): boolean {
  const size = board.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      if (cell !== null) {
        // Temporarily remove the cell value and check if it's valid
        const temp = board[row][col] as string;
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
export function isBoardSolved(board: SudokuBoard): boolean {
  return isBoardComplete(board) && validateBoard(board);
}
