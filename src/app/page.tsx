'use client';

import { useState } from 'react';
import BoardSizeSelection from './components/BoardSizeSelection';
import SudokuGame from './components/SudokuGame';
import PrintBoard from './components/PrintBoard';

type GameMode = 'menu' | 'play' | 'print' | 'size-selection-play' | 'size-selection-print';

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [boardSize, setBoardSize] = useState<4 | 6 | 9>(9);

  const handleStartGame = () => {
    setGameMode('size-selection-play');
  };


  const handleSizeSelection = (size: 4 | 6 | 9, mode: 'play' | 'print') => {
    setBoardSize(size);
    setGameMode(mode);
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

  if (gameMode === 'size-selection-play' || gameMode === 'size-selection-print') {
    const mode = gameMode === 'size-selection-play' ? 'play' : 'print';
    return (
      <BoardSizeSelection
        onSizeSelect={(size) => handleSizeSelection(size, mode)}
        onBack={handleBackToMenu}
        mode={mode}
      />
    );
  }

  if (gameMode === 'play') {
    return (
      <SudokuGame
        size={boardSize}
        onBack={handleBack}
        onPrintBoard={handlePrintFromGame}
      />
    );
  }

  if (gameMode === 'print') {
    return (
      <PrintBoard
        size={boardSize}
        onBack={handleBack}
      />
    );
  }

  return null;
}
