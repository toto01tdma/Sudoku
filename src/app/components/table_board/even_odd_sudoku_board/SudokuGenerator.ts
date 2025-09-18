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
  // Try multiple times to generate a valid board
  for (let attempt = 0; attempt < 50; attempt++) {
    const board = createEmptyBoard(size);
    
    // Use a more strategic approach: fill some cells first to guide the solution
    if (fillBoardStrategically(board)) {
      return board;
    }
  }
  
  // Fallback: generate a classic sudoku and try to modify it to fit even-odd constraints
  return generateFallbackBoard(size);
}

// Strategic board filling for Even-Odd Sudoku
function fillBoardStrategically(board: SudokuBoard): boolean {
  const size = board.length;
  
  // First, try to place some numbers strategically
  const positions = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      positions.push([row, col]);
    }
  }
  
  // Shuffle positions for randomness
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Try to fill the board
  return solveSudoku(board);
}

// Fallback board generation using classic approach
function generateFallbackBoard(size: number): SudokuBoard {
  const board = createEmptyBoard(size);
  
  // Fill diagonal boxes first (they don't interfere with each other)
  fillDiagonalBoxes(board);
  
  // Fill remaining cells
  solveSudoku(board);
  
  return board;
}

// Fill diagonal 3x3 boxes for 9x9, or equivalent for other sizes
function fillDiagonalBoxes(board: SudokuBoard): void {
  const size = board.length;
  const boxSize = Math.sqrt(size);
  
  for (let box = 0; box < size; box += boxSize) {
    fillBox(board, box, box);
  }
}

// Fill a single box with random valid numbers
function fillBox(board: SudokuBoard, row: number, col: number): void {
  const size = board.length;
  const boxSize = Math.sqrt(size);
  const numbers = Array.from({ length: size }, (_, i) => i + 1);
  
  // Shuffle numbers
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  let numIndex = 0;
  for (let i = 0; i < boxSize; i++) {
    for (let j = 0; j < boxSize; j++) {
      const currentRow = row + i;
      const currentCol = col + j;
      
      // Try to place a number that fits even-odd constraints
      for (let attempt = 0; attempt < numbers.length; attempt++) {
        const num = numbers[(numIndex + attempt) % numbers.length];
        if (isValidMove(board, currentRow, currentCol, num)) {
          board[currentRow][currentCol] = num;
          numIndex++;
          break;
        }
      }
    }
  }
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
      cellsToRemove = Math.floor(totalCells * 0.4);
      break;
    case 'medium':
      cellsToRemove = Math.floor(totalCells * 0.5);
      break;
    case 'hard':
      cellsToRemove = Math.floor(totalCells * 0.6);
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
  
  // Remove numbers, but ensure even initial numbers are only in shaded cells
  // and that each box has at least some initial clues
  const evenOddPattern = getEvenOddPattern(size);
  const boxSize = Math.sqrt(size);
  const numBoxes = size;
  
  // Track clues per box to ensure distribution
  const cluesPerBox: number[] = new Array(numBoxes).fill(0);
  const minCluesPerBox = Math.max(1, Math.floor(size / 3));
  
  // Count initial clues per box
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const boxIndex = Math.floor(row / boxSize) * boxSize + Math.floor(col / boxSize);
      cluesPerBox[boxIndex]++;
    }
  }
  
  let removedCount = 0;
  
  for (let i = 0; i < positions.length && removedCount < cellsToRemove; i++) {
    const [row, col] = positions[i];
    const cellValue = puzzle[row][col] as number;
    const isShaded = evenOddPattern[row][col];
    const isEven = cellValue % 2 === 0;
    const boxIndex = Math.floor(row / boxSize) * boxSize + Math.floor(col / boxSize);
    
    // Don't remove if this would leave a box with too few clues
    const wouldLeaveBoxEmpty = cluesPerBox[boxIndex] <= minCluesPerBox;
    
    // If it's an even number in an unshaded cell, always remove it (unless box constraint)
    // If it's an odd number in a shaded cell, always remove it (unless box constraint)
    // Otherwise, remove based on normal probability
    if ((isEven && !isShaded) || (!isEven && isShaded)) {
      if (!wouldLeaveBoxEmpty) {
        puzzle[row][col] = null;
        cluesPerBox[boxIndex]--;
        removedCount++;
      }
    } else if (removedCount < cellsToRemove && !wouldLeaveBoxEmpty) {
      puzzle[row][col] = null;
      cluesPerBox[boxIndex]--;
      removedCount++;
    }
  }
  
  // Second pass: ensure all boxes have at least one clue
  for (let boxIndex = 0; boxIndex < numBoxes; boxIndex++) {
    if (cluesPerBox[boxIndex] === 0) {
      // Find a cell in this box that we can restore
      const boxRow = Math.floor(boxIndex / boxSize) * boxSize;
      const boxCol = (boxIndex % boxSize) * boxSize;
      
      for (let r = boxRow; r < boxRow + boxSize; r++) {
        for (let c = boxCol; c < boxCol + boxSize; c++) {
          if (puzzle[r][c] === null) {
            const cellValue = solution[r][c] as number;
            const isShaded = evenOddPattern[r][c];
            const isEven = cellValue % 2 === 0;
            
            // Only restore if it follows even/odd rules
            if ((isEven && isShaded) || (!isEven && !isShaded)) {
              puzzle[r][c] = cellValue;
              cluesPerBox[boxIndex]++;
              break;
            }
          }
        }
        if (cluesPerBox[boxIndex] > 0) break;
      }
    }
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
