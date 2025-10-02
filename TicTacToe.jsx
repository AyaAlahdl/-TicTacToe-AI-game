import React, { useState, useEffect } from 'react';
import { X, Circle, RotateCcw } from 'lucide-react';

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winLine, setWinLine] = useState(null);
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 });

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (currentBoard) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: pattern };
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'draw', line: null };
    }
    return null;
  };

  const minimax = (currentBoard, depth, isMaximizing) => {
    const result = checkWinner(currentBoard);
    if (result) {
      if (result.winner === 'O') return 10 - depth;
      if (result.winner === 'X') return depth - 10;
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          const score = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (currentBoard) => {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        const newBoard = [...board];
        const move = getBestMove(newBoard);
        if (move !== null) {
          newBoard[move] = 'O';
          setBoard(newBoard);
          
          const result = checkWinner(newBoard);
          if (result) {
            setWinner(result.winner);
            setWinLine(result.line);
            if (result.winner === 'O') {
              setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
            } else if (result.winner === 'draw') {
              setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
            }
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, winner]);

  const handleClick = (index) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinLine(result.line);
      if (result.winner === 'X') {
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
      } else if (result.winner === 'draw') {
        setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      }
    } else {
      setIsPlayerTurn(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setWinLine(null);
  };

  const isWinningCell = (index) => {
    return winLine && winLine.includes(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white text-center mb-2">TicTacToe AI</h1>
          <p className="text-white/80 text-center mb-6">Challenge the Unbeatable AI</p>
          
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <div className="flex justify-around text-white">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{score.player}</div>
                <div className="text-sm text-white/70">You</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{score.draws}</div>
                <div className="text-sm text-white/70">Draws</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{score.ai}</div>
                <div className="text-sm text-white/70">AI</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={!isPlayerTurn || winner || cell}
                className={`aspect-square bg-white/10 backdrop-blur rounded-2xl border-2 transition-all duration-300 flex items-center justify-center text-5xl font-bold
                  ${isWinningCell(index) ? 'border-yellow-400 bg-yellow-400/20' : 'border-white/20'}
                  ${!cell && isPlayerTurn && !winner ? 'hover:bg-white/20 hover:scale-105 cursor-pointer' : ''}
                  ${!isPlayerTurn && !winner && !cell ? 'opacity-50' : ''}`}
              >
                {cell === 'X' && <X className="w-12 h-12 text-blue-400" strokeWidth={3} />}
                {cell === 'O' && <Circle className="w-12 h-12 text-red-400" strokeWidth={3} />}
              </button>
            ))}
          </div>

          {winner && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-white mb-2">
                {winner === 'X' && '🎉 You Won!'}
                {winner === 'O' && '🤖 AI Wins!'}
                {winner === 'draw' && '🤝 It\'s a Draw!'}
              </div>
            </div>
          )}

          {!winner && (
            <div className="text-center text-white/80 mb-4">
              {isPlayerTurn ? '🔵 Your Turn (X)' : '🔴 AI Thinking...'}
            </div>
          )}

          <button
            onClick={resetGame}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
