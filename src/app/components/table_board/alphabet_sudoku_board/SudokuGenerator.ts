export type SudokuCell = string | null; // Letters instead of numbers
export type SudokuBoard = SudokuCell[][];

// Helper function to create empty board
export function createEmptyBoard(size: number): SudokuBoard {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// Get the letters to use based on board size
export function getLettersForSize(size: number): string[] {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters.slice(0, size).split('');
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

// Check if a letter is valid in a specific position for Alphabet Sudoku
export function isValidMove(board: SudokuBoard, row: number, col: number, letter: string): boolean {
  const size = board.length;
  const validLetters = getLettersForSize(size);
  
  // Check if the letter is valid for this board size
  if (!validLetters.includes(letter.toUpperCase())) {
    return false;
  }
  
  const upperLetter = letter.toUpperCase();
  
  // Check row
  for (let c = 0; c < size; c++) {
    if (c !== col && board[row][c] === upperLetter) {
      return false;
    }
  }
  
  // Check column
  for (let r = 0; r < size; r++) {
    if (r !== row && board[r][col] === upperLetter) {
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
      if ((r !== row || c !== col) && board[r][c] === upperLetter) {
        return false;
      }
    }
  }
  
  return true;
}

// Simple Alphabet Sudoku solver using backtracking
export function solveSudoku(board: SudokuBoard): boolean {
  const size = board.length;
  const letters = getLettersForSize(size);
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === null) {
        for (const letter of letters) {
          if (isValidMove(board, row, col, letter)) {
            board[row][col] = letter;
            
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

// Generate a complete valid Alphabet Sudoku board
export function generateCompleteBoard(size: number): SudokuBoard {
  const board = createEmptyBoard(size);
  const letters = getLettersForSize(size);
  
  // Use backtracking to generate a complete valid board
  // Add some random seeding to make each board different
  const shuffledLetters = [...letters];
  
  // Shuffle the letters for the first row to add randomness
  for (let i = shuffledLetters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
  }
  
  // Fill the first row with shuffled letters
  for (let col = 0; col < size; col++) {
    board[0][col] = shuffledLetters[col];
  }
  
  // Fill remaining cells using backtracking
  solveSudoku(board);
  
  return board;
}

// Generate a playable Alphabet Sudoku puzzle by removing letters from a complete board
export function generatePuzzle(size: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
} {
  const solution = generateCompleteBoard(size);
  const puzzle = solution.map(row => [...row]);
  
  // Remove letters based on difficulty
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
  
  // Remove letters
  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = null;
  }
  
  return { puzzle, solution };
}

// Validate the entire Alphabet Sudoku board
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

// Check if the board is completely filled
export function isBoardComplete(board: SudokuBoard): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

// Check if the board is solved (complete and valid)
export function isBoardSolved(board: SudokuBoard): boolean {
  return isBoardComplete(board) && validateBoard(board);
}

// Helper function to convert number input to letter (for UI compatibility)
export function numberToLetter(num: number, size: number): string | null {
  if (num < 1 || num > size) return null;
  const letters = getLettersForSize(size);
  return letters[num - 1];
}

// Helper function to convert letter to number (for UI compatibility)
export function letterToNumber(letter: string, size: number): number | null {
  const letters = getLettersForSize(size);
  const index = letters.indexOf(letter.toUpperCase());
  return index >= 0 ? index + 1 : null;
}
