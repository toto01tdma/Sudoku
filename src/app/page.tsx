'use client';

import { useState } from 'react';
import BoardSizeSelection from './components/BoardSizeSelection';
import SudokuGame from './components/SudokuGame';
import { SudokuType, SudokuSize } from './components/table_board/types';
import PrintBoard from './components/PrintBoard';

type GameMode = 'menu' | 'play' | 'print' | 'size-selection-play' | 'size-selection-print';

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [boardSize, setBoardSize] = useState<SudokuSize>(9);
  const [sudokuType, setSudokuType] = useState<SudokuType>('classic');

  const handleStartGame = () => {
    setGameMode('size-selection-play');
  };


  const handleSizeSelection = (size: SudokuSize, type: SudokuType) => {
    setBoardSize(size);
    setSudokuType(type);
    setGameMode('play');
  };

  const handleBack = () => {
    if (gameMode === 'play') {
      setGameMode('size-selection-play');
    } else if (gameMode === 'print') {
      setGameMode('play');
    } else {
      setGameMode('menu');
    }
  };

  const handlePrintFromGame = () => {
    setGameMode('print');
  };

  const handleBackToMenu = () => {
    setGameMode('menu');
  };

  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center max-w-md w-full">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
            Sudoku Game
          </h1>
          
          <div className="space-y-4">
            <button
              onClick={handleStartGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg text-xl transition-colors duration-200 shadow-lg"
            >
              Start Game
            </button>
            
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'size-selection-play') {
    return (
      <BoardSizeSelection
        onSizeSelect={handleSizeSelection}
        onBack={handleBackToMenu}
        mode="play"
      />
    );
  }

  if (gameMode === 'play') {
    return (
      <SudokuGame
        size={boardSize}
        sudokuType={sudokuType}
        onBack={handleBack}
        onPrintBoard={handlePrintFromGame}
      />
    );
  }

  if (gameMode === 'print') {
    return (
      <PrintBoard
        size={boardSize}
        sudokuType={sudokuType}
        onBack={handleBack}
      />
    );
  }

  return null;
}
