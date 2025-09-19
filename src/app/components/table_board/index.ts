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

// Export Thai Alphabet Sudoku
export * as ThaiAlphabetSudoku from './thai_alphabet_sudoku_board/SudokuGenerator';
export { default as ThaiAlphabetSudokuBoard } from './thai_alphabet_sudoku_board/SudokuBoard';

// Export Consecutive Sudoku
export * as ConsecutiveSudoku from './consecutive_sudoku_board/SudokuGenerator';
export { default as ConsecutiveSudokuBoard } from './consecutive_sudoku_board/SudokuBoard';

// Export Asterisk Sudoku
export * as AsteriskSudoku from './asterisk_sudoku_board/SudokuGenerator';
export { default as AsteriskSudokuBoard } from './asterisk_sudoku_board/SudokuBoard';

// Export Jigsaw Sudoku
export * as JigsawSudoku from './jigsaw_sudoku_board/SudokuGenerator';
export { default as JigsawSudokuBoard } from './jigsaw_sudoku_board/SudokuBoard';

// Export Windoku Sudoku
export * as WindokuSudoku from './windoku_sudoku_board/SudokuGenerator';
export { default as WindokuSudokuBoard } from './windoku_sudoku_board/SudokuBoard';

// Default exports for backward compatibility
export type { SudokuBoard } from './classic_sudoku_board/SudokuGenerator';
export { generatePuzzle, isValidMove, isBoardComplete } from './classic_sudoku_board/SudokuGenerator';
export { default as SudokuBoardComponent } from './classic_sudoku_board/SudokuBoard';
