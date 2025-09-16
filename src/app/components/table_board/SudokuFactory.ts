import { SudokuType, SudokuTypeConfig, SudokuSize } from './types';
import * as ClassicSudoku from './classic_sudoku_board/SudokuGenerator';
import * as DiagonalSudoku from './diagonal_sudoku_board/SudokuGenerator';
import * as AlphabetSudoku from './alphabet_sudoku_board/SudokuGenerator';
import * as EvenOddSudoku from './even_odd_sudoku_board/SudokuGenerator';

// Sudoku type configurations
export const SUDOKU_TYPES: Record<SudokuType, SudokuTypeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic Sudoku',
    description: 'Traditional Sudoku with standard rules',
    availableSizes: [4, 6, 9],
    generator: {
      generatePuzzle: ClassicSudoku.generatePuzzle as any,
      isValidMove: (board: any, row: number, col: number, value: number | string) => {
        return ClassicSudoku.isValidMove(board, row, col, value as number);
      },
      validateBoard: ClassicSudoku.validateBoard as any,
      isBoardComplete: ClassicSudoku.isBoardComplete as any,
      isBoardSolved: ClassicSudoku.isBoardSolved as any,
    }
  },
  diagonal: {
    id: 'diagonal',
    name: 'Diagonal Sudoku',
    description: 'Sudoku with additional diagonal constraints',
    availableSizes: [4, 6, 9],
    generator: {
      generatePuzzle: DiagonalSudoku.generatePuzzle as any,
      isValidMove: (board: any, row: number, col: number, value: number | string) => {
        return DiagonalSudoku.isValidMove(board, row, col, value as number);
      },
      validateBoard: DiagonalSudoku.validateBoard as any,
      isBoardComplete: DiagonalSudoku.isBoardComplete as any,
      isBoardSolved: DiagonalSudoku.isBoardSolved as any,
    }
  },
  // Placeholder for future implementations
  alphabet: {
    id: 'alphabet',
    name: 'Alphabet Sudoku',
    description: 'Sudoku using letters instead of numbers',
    availableSizes: [4, 6, 9],
    generator: {
      generatePuzzle: AlphabetSudoku.generatePuzzle as any,
      isValidMove: (board: any, row: number, col: number, value: number | string) => {
        return AlphabetSudoku.isValidMove(board, row, col, value as string);
      },
      validateBoard: AlphabetSudoku.validateBoard as any,
      isBoardComplete: AlphabetSudoku.isBoardComplete as any,
      isBoardSolved: AlphabetSudoku.isBoardSolved as any,
    }
  },
  jigsaw: {
    id: 'jigsaw',
    name: 'Jigsaw Sudoku',
    description: 'Sudoku with irregular shaped regions',
    availableSizes: [9],
    generator: {
      generatePuzzle: ClassicSudoku.generatePuzzle, // Temporary fallback
      isValidMove: ClassicSudoku.isValidMove,
      validateBoard: ClassicSudoku.validateBoard,
      isBoardComplete: ClassicSudoku.isBoardComplete,
      isBoardSolved: ClassicSudoku.isBoardSolved,
    }
  },
  'even-odd': {
    id: 'even-odd',
    name: 'Even-Odd Sudoku',
    description: 'Sudoku with even/odd constraints',
    availableSizes: [4, 6, 9],
    generator: {
      generatePuzzle: EvenOddSudoku.generatePuzzle as any,
      isValidMove: (board: any, row: number, col: number, value: number | string) => {
        return EvenOddSudoku.isValidMove(board, row, col, value as number);
      },
      validateBoard: EvenOddSudoku.validateBoard as any,
      isBoardComplete: EvenOddSudoku.isBoardComplete as any,
      isBoardSolved: EvenOddSudoku.isBoardSolved as any,
    }
  },
  consecutive: {
    id: 'consecutive',
    name: 'Consecutive Sudoku',
    description: 'Sudoku with consecutive number constraints',
    availableSizes: [9],
    generator: {
      generatePuzzle: ClassicSudoku.generatePuzzle, // Temporary fallback
      isValidMove: ClassicSudoku.isValidMove,
      validateBoard: ClassicSudoku.validateBoard,
      isBoardComplete: ClassicSudoku.isBoardComplete,
      isBoardSolved: ClassicSudoku.isBoardSolved,
    }
  },
  asterisk: {
    id: 'asterisk',
    name: 'Asterisk Sudoku',
    description: 'Sudoku with asterisk pattern constraints',
    availableSizes: [9],
    generator: {
      generatePuzzle: ClassicSudoku.generatePuzzle, // Temporary fallback
      isValidMove: ClassicSudoku.isValidMove,
      validateBoard: ClassicSudoku.validateBoard,
      isBoardComplete: ClassicSudoku.isBoardComplete,
      isBoardSolved: ClassicSudoku.isBoardSolved,
    }
  },
  'thai-alphabet': {
    id: 'thai-alphabet',
    name: 'Thai Alphabet Sudoku',
    description: 'Sudoku using Thai alphabet characters',
    availableSizes: [9],
    generator: {
      generatePuzzle: ClassicSudoku.generatePuzzle, // Temporary fallback
      isValidMove: ClassicSudoku.isValidMove,
      validateBoard: ClassicSudoku.validateBoard,
      isBoardComplete: ClassicSudoku.isBoardComplete,
      isBoardSolved: ClassicSudoku.isBoardSolved,
    }
  },
  'diagonal-jigsaw': {
    id: 'diagonal-jigsaw',
    name: 'Diagonal Jigsaw Sudoku',
    description: 'Combination of diagonal and jigsaw constraints',
    availableSizes: [9],
    generator: {
      generatePuzzle: DiagonalSudoku.generatePuzzle, // Use diagonal for now
      isValidMove: DiagonalSudoku.isValidMove,
      validateBoard: DiagonalSudoku.validateBoard,
      isBoardComplete: DiagonalSudoku.isBoardComplete,
      isBoardSolved: DiagonalSudoku.isBoardSolved,
    }
  },
  windoku: {
    id: 'windoku',
    name: 'Windoku',
    description: 'Sudoku with additional windowed regions',
    availableSizes: [9],
    generator: {
      generatePuzzle: ClassicSudoku.generatePuzzle, // Temporary fallback
      isValidMove: ClassicSudoku.isValidMove,
      validateBoard: ClassicSudoku.validateBoard,
      isBoardComplete: ClassicSudoku.isBoardComplete,
      isBoardSolved: ClassicSudoku.isBoardSolved,
    }
  }
};

// Get Sudoku type configuration
export function getSudokuType(type: SudokuType): SudokuTypeConfig {
  return SUDOKU_TYPES[type];
}

// Get all available Sudoku types
export function getAllSudokuTypes(): SudokuTypeConfig[] {
  return Object.values(SUDOKU_TYPES);
}

// Get implemented Sudoku types
export function getImplementedSudokuTypes(): SudokuTypeConfig[] {
  return [SUDOKU_TYPES.classic, SUDOKU_TYPES.diagonal, SUDOKU_TYPES.alphabet, SUDOKU_TYPES['even-odd']];
}

// Check if a Sudoku type is implemented
export function isSudokuTypeImplemented(type: SudokuType): boolean {
  return type === 'classic' || type === 'diagonal' || type === 'alphabet' || type === 'even-odd';
}
