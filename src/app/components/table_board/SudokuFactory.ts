import { SudokuType, SudokuTypeConfig, SudokuBoard, SudokuSize, Difficulty } from './types';
import * as ClassicSudoku from './classic_sudoku_board/SudokuGenerator';
import * as DiagonalSudoku from './diagonal_sudoku_board/SudokuGenerator';
import * as AlphabetSudoku from './alphabet_sudoku_board/SudokuGenerator';
import * as EvenOddSudoku from './even_odd_sudoku_board/SudokuGenerator';
import * as ThaiAlphabetSudoku from './thai_alphabet_sudoku_board/SudokuGenerator';
import * as ConsecutiveSudoku from './consecutive_sudoku_board/SudokuGenerator';

// Sudoku type configurations
export const SUDOKU_TYPES: Record<SudokuType, SudokuTypeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic Sudoku',
    description: 'Traditional Sudoku with standard rules',
    availableSizes: [4, 6, 9],
    generator: {
      generatePuzzle: (size: SudokuSize, difficulty?: Difficulty) => {
        const result = ClassicSudoku.generatePuzzle(size, difficulty);
        return { puzzle: result.puzzle as SudokuBoard, solution: result.solution as SudokuBoard };
      },
      isValidMove: (board: SudokuBoard, row: number, col: number, value: number | string) => {
        return ClassicSudoku.isValidMove(board, row, col, value as number);
      },
      validateBoard: (board: SudokuBoard) => ClassicSudoku.validateBoard(board),
      isBoardComplete: (board: SudokuBoard) => ClassicSudoku.isBoardComplete(board),
      isBoardSolved: (board: SudokuBoard) => ClassicSudoku.isBoardSolved(board),
    }
  },
  diagonal: {
    id: 'diagonal',
    name: 'Diagonal Sudoku',
    description: 'Sudoku with additional diagonal constraints',
    availableSizes: [4, 6, 9],
    generator: {
      generatePuzzle: (size: SudokuSize, difficulty?: Difficulty) => {
        const result = DiagonalSudoku.generatePuzzle(size, difficulty);
        return { puzzle: result.puzzle as SudokuBoard, solution: result.solution as SudokuBoard };
      },
      isValidMove: (board: SudokuBoard, row: number, col: number, value: number | string) => {
        return DiagonalSudoku.isValidMove(board, row, col, value as number);
      },
      validateBoard: (board: SudokuBoard) => DiagonalSudoku.validateBoard(board),
      isBoardComplete: (board: SudokuBoard) => DiagonalSudoku.isBoardComplete(board),
      isBoardSolved: (board: SudokuBoard) => DiagonalSudoku.isBoardSolved(board),
    }
  },
  // Placeholder for future implementations
  alphabet: {
    id: 'alphabet',
    name: 'Alphabet Sudoku',
    description: 'Sudoku using letters instead of numbers',
    availableSizes: [4, 6, 9],
    generator: {
      generatePuzzle: (size: SudokuSize, difficulty?: Difficulty) => {
        const result = AlphabetSudoku.generatePuzzle(size, difficulty);
        return { puzzle: result.puzzle as SudokuBoard, solution: result.solution as SudokuBoard };
      },
      isValidMove: (board: SudokuBoard, row: number, col: number, value: number | string) => {
        return AlphabetSudoku.isValidMove(board, row, col, value as string);
      },
      validateBoard: (board: SudokuBoard) => AlphabetSudoku.validateBoard(board),
      isBoardComplete: (board: SudokuBoard) => AlphabetSudoku.isBoardComplete(board),
      isBoardSolved: (board: SudokuBoard) => AlphabetSudoku.isBoardSolved(board),
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
      generatePuzzle: (size: SudokuSize, difficulty?: Difficulty) => {
        const result = EvenOddSudoku.generatePuzzle(size, difficulty);
        return { puzzle: result.puzzle as SudokuBoard, solution: result.solution as SudokuBoard };
      },
      isValidMove: (board: SudokuBoard, row: number, col: number, value: number | string) => {
        return EvenOddSudoku.isValidMove(board, row, col, value as number);
      },
      validateBoard: (board: SudokuBoard) => EvenOddSudoku.validateBoard(board),
      isBoardComplete: (board: SudokuBoard) => EvenOddSudoku.isBoardComplete(board),
      isBoardSolved: (board: SudokuBoard) => EvenOddSudoku.isBoardSolved(board),
    }
  },
  consecutive: {
    id: 'consecutive',
    name: 'Consecutive Sudoku',
    description: 'Sudoku with consecutive number constraints',
    availableSizes: [4, 6, 9],
    generator: {
      generatePuzzle: (size: SudokuSize, difficulty?: Difficulty) => {
        const result = ConsecutiveSudoku.generatePuzzle(size, difficulty);
        return { 
          puzzle: result.puzzle as SudokuBoard, 
          solution: result.solution as SudokuBoard,
          constraints: result.constraints 
        };
      },
      isValidMove: (board: SudokuBoard, row: number, col: number, value: number | string) => {
        // For consecutive sudoku, we need constraints, but this is a simplified check
        // The actual validation will be done in the component with full constraints
        return ClassicSudoku.isValidMove(board, row, col, value as number);
      },
      validateBoard: (board: SudokuBoard) => ClassicSudoku.validateBoard(board),
      isBoardComplete: (board: SudokuBoard) => ConsecutiveSudoku.isBoardComplete(board),
      isBoardSolved: (board: SudokuBoard) => ConsecutiveSudoku.isBoardComplete(board),
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
    availableSizes: [4, 6, 9],
    generator: {
      generatePuzzle: (size: SudokuSize, difficulty?: Difficulty) => {
        const result = ThaiAlphabetSudoku.generatePuzzle(size, difficulty);
        return { puzzle: result.puzzle as SudokuBoard, solution: result.solution as SudokuBoard };
      },
      isValidMove: (board: SudokuBoard, row: number, col: number, value: number | string) => {
        return ThaiAlphabetSudoku.isValidMove(board, row, col, value as string);
      },
      validateBoard: (board: SudokuBoard) => ThaiAlphabetSudoku.validateBoard(board),
      isBoardComplete: (board: SudokuBoard) => ThaiAlphabetSudoku.isBoardComplete(board),
      isBoardSolved: (board: SudokuBoard) => ThaiAlphabetSudoku.isBoardSolved(board),
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
  return [
    SUDOKU_TYPES.classic, 
    SUDOKU_TYPES.diagonal, 
    SUDOKU_TYPES.alphabet, 
    SUDOKU_TYPES['even-odd'],
    SUDOKU_TYPES['thai-alphabet']
  ];
}

// Check if a Sudoku type is implemented
export function isSudokuTypeImplemented(type: SudokuType): boolean {
  return type === 'classic' || 
         type === 'diagonal' || 
         type === 'alphabet' || 
         type === 'even-odd' ||
         type === 'thai-alphabet';
}
