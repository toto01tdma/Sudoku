// Common types for all Sudoku variants
export type SudokuCell = number | string | null;
export type SudokuBoard = SudokuCell[][];

// Union type for board compatibility across different Sudoku types
export type AnyBoard = SudokuBoard;

export type SudokuType = 'classic' | 'diagonal' | 'alphabet' | 'jigsaw' | 'even-odd' | 'consecutive' | 'asterisk' | 'thai-alphabet' | 'diagonal-jigsaw' | 'windoku';

export type SudokuSize = 4 | 6 | 9;

export type Difficulty = 'easy' | 'medium' | 'hard';

// Interface for Sudoku generator implementations
export interface SudokuGenerator {
  generatePuzzle(size: SudokuSize, difficulty?: Difficulty): {
    puzzle: SudokuBoard;
    solution: SudokuBoard;
  };
  isValidMove(board: SudokuBoard, row: number, col: number, value: number | string): boolean;
  validateBoard(board: SudokuBoard): boolean;
  isBoardComplete(board: SudokuBoard): boolean;
  isBoardSolved(board: SudokuBoard): boolean;
}

// Sudoku type configuration
export interface SudokuTypeConfig {
  id: SudokuType;
  name: string;
  description: string;
  availableSizes: SudokuSize[];
  generator: SudokuGenerator;
}
