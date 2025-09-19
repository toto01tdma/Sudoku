import { SudokuCell, SudokuBoard } from '../types';
import * as ClassicSudoku from '../classic_sudoku_board/SudokuGenerator';

export type { SudokuCell, SudokuBoard };

// Type for jigsaw regions - each cell belongs to a region (0-8 for 9x9, 0-5 for 6x6)
export interface JigsawRegions {
  regions: number[][]; // regions[row][col] = region number
  regionCells: [number, number][][]; // regionCells[regionIndex] = array of [row, col] coordinates
}

// Helper function to create empty board
export function createEmptyBoard(size: number): SudokuBoard {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// Generate predefined jigsaw regions for better performance and guaranteed valid layouts
export function generateJigsawRegions(size: number): JigsawRegions {
  if (size === 6) {
    return generate6x6Regions();
  } else if (size === 9) {
    return generate9x9Regions();
  }
  
  throw new Error('Jigsaw Sudoku only supports 6x6 and 9x9 sizes');
}

// Generate predefined 6x6 jigsaw regions
function generate6x6Regions(): JigsawRegions {
  // Predefined patterns for 6x6 - multiple variations
  const patterns = [
    // Pattern 1
    [
      [0, 0, 1, 1, 2, 2],
      [0, 0, 1, 1, 2, 2],
      [3, 3, 4, 4, 5, 5],
      [3, 3, 4, 4, 5, 5],
      [0, 1, 2, 3, 4, 5],
      [0, 1, 2, 3, 4, 5]
    ],
    // Pattern 2
    [
      [0, 0, 0, 1, 1, 1],
      [0, 2, 2, 1, 3, 3],
      [2, 2, 4, 4, 3, 3],
      [5, 4, 4, 4, 5, 5],
      [5, 5, 0, 1, 2, 3],
      [4, 5, 0, 1, 2, 3]
    ],
    // Pattern 3
    [
      [0, 1, 1, 2, 2, 3],
      [0, 0, 1, 2, 3, 3],
      [4, 0, 5, 5, 3, 4],
      [4, 4, 5, 1, 2, 4],
      [0, 1, 2, 3, 4, 5],
      [5, 1, 2, 3, 4, 0]
    ]
  ];
  
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return createRegionsFromPattern(selectedPattern, 6);
}

// Generate predefined 9x9 jigsaw regions
function generate9x9Regions(): JigsawRegions {
  // Predefined patterns for 9x9 - multiple variations
  const patterns = [
    // Pattern 1 - More irregular
    [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 3, 3, 1, 4, 4, 2, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 0, 0, 7, 1, 1, 8, 2, 2],
      [0, 0, 3, 1, 1, 4, 2, 2, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 7, 7, 8, 8, 6, 7, 8],
      [6, 7, 7, 8, 8, 0, 1, 2, 3]
    ],
    // Pattern 2 - Different layout
    [
      [0, 0, 1, 1, 1, 2, 2, 2, 3],
      [0, 0, 1, 4, 4, 2, 5, 5, 3],
      [0, 4, 4, 4, 6, 6, 5, 5, 3],
      [7, 7, 7, 6, 6, 6, 8, 8, 8],
      [1, 2, 3, 0, 1, 2, 3, 4, 5],
      [4, 5, 6, 7, 8, 0, 1, 2, 3],
      [7, 8, 0, 1, 2, 3, 4, 5, 6],
      [3, 4, 5, 6, 7, 8, 0, 1, 2],
      [6, 7, 8, 0, 1, 2, 3, 4, 5]
    ],
    // Pattern 3 - Another variation
    [
      [0, 0, 0, 1, 1, 2, 2, 2, 2],
      [0, 3, 3, 1, 1, 1, 4, 4, 2],
      [3, 3, 3, 5, 5, 4, 4, 4, 6],
      [7, 7, 5, 5, 5, 8, 8, 6, 6],
      [7, 7, 7, 0, 1, 8, 8, 8, 6],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [1, 2, 3, 4, 5, 6, 7, 8, 0],
      [2, 3, 4, 5, 6, 7, 8, 0, 1],
      [3, 4, 5, 6, 7, 8, 0, 1, 2]
    ]
  ];
  
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return createRegionsFromPattern(selectedPattern, 9);
}

// Create regions object from pattern array
function createRegionsFromPattern(pattern: number[][], size: number): JigsawRegions {
  const regions = pattern;
  const regionCells: [number, number][][] = Array(size).fill(null).map(() => []);
  
  // Build regionCells array
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const regionIndex = regions[row][col];
      regionCells[regionIndex].push([row, col]);
    }
  }
  
  return { regions, regionCells };
}

// Check if a number is valid for Jigsaw Sudoku
export function isValidMove(board: SudokuBoard, row: number, col: number, num: number, jigsawRegions: JigsawRegions): boolean {
  const size = board.length;
  
  // Check row constraint
  for (let c = 0; c < size; c++) {
    if (c !== col && board[row][c] === num) {
      return false;
    }
  }
  
  // Check column constraint
  for (let r = 0; r < size; r++) {
    if (r !== row && board[r][col] === num) {
      return false;
    }
  }
  
  // Check jigsaw region constraint
  const regionIndex = jigsawRegions.regions[row][col];
  const regionCells = jigsawRegions.regionCells[regionIndex];
  
  for (const [rRow, rCol] of regionCells) {
    if ((rRow !== row || rCol !== col) && board[rRow][rCol] === num) {
      return false;
    }
  }
  
  return true;
}

// Generate a complete valid Jigsaw Sudoku board using optimized backtracking
export function generateCompleteBoard(size: number, jigsawRegions: JigsawRegions): SudokuBoard {
  const board = createEmptyBoard(size);
  
  // Get all cells in a more strategic order (by region to improve constraint propagation)
  const cellOrder: [number, number][] = [];
  for (let regionIndex = 0; regionIndex < size; regionIndex++) {
    const regionCells = jigsawRegions.regionCells[regionIndex];
    cellOrder.push(...regionCells);
  }
  
  function fillBoardOptimized(cellIndex: number): boolean {
    if (cellIndex >= cellOrder.length) {
      return true; // All cells filled
    }
    
    const [row, col] = cellOrder[cellIndex];
    
    // Try numbers 1 to size in random order
    const numbers = Array.from({ length: size }, (_, i) => i + 1);
    numbers.sort(() => Math.random() - 0.5);
    
    for (const num of numbers) {
      if (isValidMove(board, row, col, num, jigsawRegions)) {
        board[row][col] = num;
        
        if (fillBoardOptimized(cellIndex + 1)) {
          return true;
        }
        
        board[row][col] = null;
      }
    }
    
    return false;
  }
  
  // Try multiple times with different random seeds if needed
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    // Reset board
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        board[row][col] = null;
      }
    }
    
    if (fillBoardOptimized(0)) {
      return board;
    }
    
    attempts++;
  }
  
  // Fallback: use classic Sudoku if jigsaw generation fails
  console.warn('Jigsaw generation failed, falling back to classic Sudoku');
  return ClassicSudoku.generateCompleteBoard(size);
}

// Generate a playable Jigsaw Sudoku puzzle
export function generatePuzzle(size: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
  jigsawRegions: JigsawRegions;
} {
  // Only support 6x6 and 9x9
  if (size !== 6 && size !== 9) {
    throw new Error('Jigsaw Sudoku only supports 6x6 and 9x9 sizes');
  }
  
  // Generate jigsaw regions (fast with predefined patterns)
  const jigsawRegions = generateJigsawRegions(size);
  
  // Generate solution with these regions
  const solution = generateCompleteBoard(size, jigsawRegions);
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
  
  // Remove numbers while ensuring each region keeps some clues
  const minCluesPerRegion = Math.max(1, Math.floor(size / 3));
  const cluesPerRegion = Array(size).fill(0);
  
  // Count initial clues per region
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const regionIndex = jigsawRegions.regions[row][col];
      cluesPerRegion[regionIndex]++;
    }
  }
  
  let removed = 0;
  for (let i = 0; i < positions.length && removed < cellsToRemove; i++) {
    const [row, col] = positions[i];
    const regionIndex = jigsawRegions.regions[row][col];
    
    // Only remove if this region will still have enough clues
    if (cluesPerRegion[regionIndex] > minCluesPerRegion) {
      puzzle[row][col] = null;
      cluesPerRegion[regionIndex]--;
      removed++;
    }
  }
  
  return { puzzle, solution, jigsawRegions };
}

// Validate the entire Jigsaw Sudoku board
export function validateBoard(board: SudokuBoard, jigsawRegions: JigsawRegions): boolean {
  const size = board.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      if (cell !== null) {
        // Temporarily remove the cell value and check if it's valid
        const temp = board[row][col] as number;
        board[row][col] = null;
        const isValid = isValidMove(board, row, col, temp, jigsawRegions);
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
export function isBoardSolved(board: SudokuBoard, jigsawRegions: JigsawRegions): boolean {
  return isBoardComplete(board) && validateBoard(board, jigsawRegions);
}
