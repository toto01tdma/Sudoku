import { SudokuCell, SudokuBoard } from '../types';
import * as ClassicSudoku from '../classic_sudoku_board/SudokuGenerator';

export type { SudokuCell, SudokuBoard };

// Helper function to create empty board
export function createEmptyBoard(size: number): SudokuBoard {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// Generate the even-odd pattern based on the solution board
// true = shaded cell (even numbers), false = unshaded cell (odd numbers)
export function generateEvenOddPattern(solution: SudokuBoard): boolean[][] {
  const size = solution.length;
  const pattern: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const value = solution[row][col] as number;
      // true for even numbers, false for odd numbers
      pattern[row][col] = value % 2 === 0;
    }
  }
  
  return pattern;
}

// Check if a cell should contain even numbers (shaded) or odd numbers (unshaded)
export function shouldBeEven(row: number, col: number, evenOddPattern: boolean[][]): boolean {
  return evenOddPattern[row][col];
}

// Check if a number is valid for Even-Odd Sudoku
export function isValidMove(board: SudokuBoard, row: number, col: number, num: number, evenOddPattern?: boolean[][]): boolean {
  // First check basic Sudoku rules
  if (!ClassicSudoku.isValidMove(board, row, col, num)) {
    return false;
  }
  
  // If we have an even-odd pattern, check the even-odd constraint
  if (evenOddPattern) {
    const shouldBeEvenNumber = shouldBeEven(row, col, evenOddPattern);
    const isEvenNumber = num % 2 === 0;
    
    if (shouldBeEvenNumber !== isEvenNumber) {
      return false;
    }
  }
  
  return true;
}

// Generate a complete valid Even-Odd Sudoku board
export function generateCompleteBoard(size: number): { board: SudokuBoard; evenOddPattern: boolean[][] } {
  // First generate a classic Sudoku solution
  const solution = ClassicSudoku.generateCompleteBoard(size);
  
  // Generate the even-odd pattern based on the solution
  const evenOddPattern = generateEvenOddPattern(solution);
  
  return { board: solution, evenOddPattern };
}

// Generate a playable Even-Odd Sudoku puzzle
export function generatePuzzle(size: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
  evenOddPattern: boolean[][];
} {
  const { board: solution, evenOddPattern } = generateCompleteBoard(size);
  const puzzle = solution.map(row => [...row]);
  
  // Remove numbers based on difficulty
  let cellsToRemove;
  const totalCells = size * size;
  
  switch (difficulty) {
    case 'easy':
      cellsToRemove = Math.floor(totalCells * 0.45); // Remove 45% (leave ~55% clues)
      break;
    case 'medium':
      cellsToRemove = Math.floor(totalCells * 0.55); // Remove 55% (leave ~45% clues)
      break;
    case 'hard':
      cellsToRemove = Math.floor(totalCells * 0.65); // Remove 65% (leave ~35% clues)
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
  
  // Track clues per box to ensure good distribution
  const numBoxes = size === 9 ? 9 : size === 6 ? 6 : 4;
  const cluesPerBox = new Array(numBoxes).fill(0);
  const minCluesPerBox = Math.max(2, Math.floor(size / 4)); // At least 2 clues per box for 9x9
  
  // Count initial clues per box
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const boxIndex = getBoxIndex(row, col, size);
      cluesPerBox[boxIndex]++;
    }
  }
  
  // Remove numbers while maintaining minimum clues per box
  let removed = 0;
  for (let i = 0; i < positions.length && removed < cellsToRemove; i++) {
    const [row, col] = positions[i];
    const boxIndex = getBoxIndex(row, col, size);
    
    // Only remove if this box will still have enough clues
    if (cluesPerBox[boxIndex] > minCluesPerBox) {
      puzzle[row][col] = null;
      cluesPerBox[boxIndex]--;
      removed++;
    }
  }
  
  // Second pass: ensure all boxes have at least one clue
  for (let boxIndex = 0; boxIndex < numBoxes; boxIndex++) {
    if (cluesPerBox[boxIndex] === 0) {
      // Find a removed cell in this box and restore it
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (getBoxIndex(row, col, size) === boxIndex && puzzle[row][col] === null) {
            puzzle[row][col] = solution[row][col];
            cluesPerBox[boxIndex]++;
            break;
          }
        }
        if (cluesPerBox[boxIndex] > 0) break;
      }
    }
  }
  
  return { puzzle, solution, evenOddPattern };
}

// Helper function to get box index
function getBoxIndex(row: number, col: number, size: number): number {
  if (size === 9) {
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    return boxRow * 3 + boxCol;
  } else if (size === 6) {
    const boxRow = Math.floor(row / 2);
    const boxCol = Math.floor(col / 3);
    return boxRow * 3 + boxCol;
  } else { // size === 4
    const boxRow = Math.floor(row / 2);
    const boxCol = Math.floor(col / 2);
    return boxRow * 2 + boxCol;
  }
}

// Validate the entire board with even-odd constraints
export function validateBoard(board: SudokuBoard, evenOddPattern?: boolean[][]): boolean {
  const size = board.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      if (cell !== null) {
        // Temporarily remove the cell value and check if it's valid
        const temp = board[row][col] as number;
        board[row][col] = null;
        const isValid = isValidMove(board, row, col, temp, evenOddPattern);
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
export function isBoardSolved(board: SudokuBoard, evenOddPattern?: boolean[][]): boolean {
  return isBoardComplete(board) && validateBoard(board, evenOddPattern);
}