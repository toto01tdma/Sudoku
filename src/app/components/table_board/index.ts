// Export common types
export * from './types';

// Export Sudoku Factory
export * from './SudokuFactory';

// Export Classic Sudoku
export * as ClassicSudoku from './classic_sudoku_board/SudokuGenerator';
export { default as ClassicSudokuBoard } from './classic_sudoku_board/SudokuBoard';

// Export Diagonal Sudoku
export * as DiagonalSudoku from './diagonal_sudoku_board/SudokuGenerator';
export { default as DiagonalSudokuBoard } from './diagonal_sudoku_board/SudokuBoard';

// Export Alphabet Sudoku
export * as AlphabetSudoku from './alphabet_sudoku_board/SudokuGenerator';
export { default as AlphabetSudokuBoard } from './alphabet_sudoku_board/SudokuBoard';

// Export Even-Odd Sudoku
export * as EvenOddSudoku from './even_odd_sudoku_board/SudokuGenerator';
export { default as EvenOddSudokuBoard } from './even_odd_sudoku_board/SudokuBoard';

// Default exports for backward compatibility
export type { SudokuBoard } from './classic_sudoku_board/SudokuGenerator';
export { generatePuzzle, isValidMove, isBoardComplete } from './classic_sudoku_board/SudokuGenerator';
export { default as SudokuBoardComponent } from './classic_sudoku_board/SudokuBoard';
