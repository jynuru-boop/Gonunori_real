import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import { GameMode, GameState, Player } from './types';
import { INITIAL_BOARD, ADJACENCY } from './constants';
import { getBestMove, getValidMoves } from './services/gameLogic';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: [...INITIAL_BOARD],
    turn: 'white',
    selectedPiece: null,
    winner: null,
    mode: null,
    scores: { white: 0, black: 0 },
    gameStarted: false,
  });

  const resetRound = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      board: [...INITIAL_BOARD],
      turn: 'white',
      selectedPiece: null,
      winner: null,
      gameStarted: false,
    }));
  }, []);

  const goHome = useCallback(() => {
    setGameState({
      board: [...INITIAL_BOARD],
      turn: 'white',
      selectedPiece: null,
      winner: null,
      mode: null,
      scores: { white: 0, black: 0 },
      gameStarted: false,
    });
  }, []);

  const handleModeSelect = (mode: GameMode) => {
    setGameState(prev => ({ ...prev, mode }));
  };

  useEffect(() => {
    if (gameState.mode === GameMode.PvAI && gameState.turn === 'black' && !gameState.winner) {
      const timer = setTimeout(() => {
        const move = getBestMove(gameState.board, 'black');
        if (move) {
          executeMove(move.from, move.to);
        } else {
          // If AI is blocked, it loses
          setGameState(prev => {
            const newScores = { ...prev.scores, white: prev.scores.white + 1 };
            return { ...prev, winner: 'white', scores: newScores };
          });
        }
      }, 700);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.turn, gameState.mode, gameState.winner, gameState.board]);

  const executeMove = (from: number, to: number) => {
    setGameState(prev => {
      const newBoard = [...prev.board];
      newBoard[to] = newBoard[from];
      newBoard[from] = null;

      const nextTurn = prev.turn === 'white' ? 'black' : 'white';
      
      // Winner is decided solely by whether the opponent is blocked
      const nextPlayerMoves = getValidMoves(newBoard, nextTurn);
      
      if (nextPlayerMoves.length === 0) {
        // Current player wins because the next player has no moves left
        const winner = prev.turn;
        const newScores = {
          ...prev.scores,
          [winner]: prev.scores[winner] + 1
        };
        return {
          ...prev,
          board: newBoard,
          selectedPiece: null,
          winner: winner,
          scores: newScores,
          gameStarted: true,
        };
      }

      return {
        ...prev,
        board: newBoard,
        turn: nextTurn,
        selectedPiece: null,
        winner: null,
        scores: prev.scores,
        gameStarted: true,
      };
    });
  };

  const handleNodeClick = (index: number) => {
    if (gameState.winner || !gameState.mode) return;
    if (gameState.mode === GameMode.PvAI && gameState.turn === 'black') return;

    const piece = gameState.board[index];
    const isMyPiece = piece === gameState.turn;

    if (isMyPiece) {
      setGameState(prev => ({ ...prev, selectedPiece: index }));
      return;
    }

    if (gameState.selectedPiece !== null && piece === null) {
      const validMoves = getValidMoves(gameState.board, gameState.turn);
      const isValid = validMoves.some(m => m.from === gameState.selectedPiece && m.to === index);

      if (isValid) {
        executeMove(gameState.selectedPiece, index);
      }
    }
  };

  const currentValidDestinations = gameState.selectedPiece !== null
    ? getValidMoves(gameState.board, gameState.turn)
        .filter(m => m.from === gameState.selectedPiece)
        .map(m => m.to)
    : [];

  return (
    <div className="min-h-screen bg-[#F5E6CA] flex flex-col items-center justify-center p-4 relative overflow-hidden font-serif text-[#3e2723]">
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="z-10 w-full max-w-md flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-8 handwritten drop-shadow-sm text-[#5d4037]">
          호박고누
        </h1>

        {!gameState.mode && (
          <div className="flex flex-col gap-6 w-full max-w-xs animate-fade-in">
            <button
              onClick={() => handleModeSelect(GameMode.PvAI)}
              className="bg-[#8d6e63] hover:bg-[#795548] text-[#fdfbf7] py-4 px-8 rounded-xl text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3 border-2 border-[#5d4037]"
            >
              <span>🤖</span> AI 대결
            </button>
            <button
              onClick={() => handleModeSelect(GameMode.PvP)}
              className="bg-[#a1887f] hover:bg-[#8d6e63] text-[#fdfbf7] py-4 px-8 rounded-xl text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3 border-2 border-[#5d4037]"
            >
              <span>👥</span> 친구 대결
            </button>
            <div className="mt-8 p-4 bg-[#fff8e1]/80 rounded-lg text-sm leading-relaxed shadow-inner border border-[#d7ccc8]">
              <p className="font-bold mb-2">📜 규칙 설명</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>상대방의 말을 움직이지 못하게 가두면 승리합니다.</strong></li>
                <li>한 줄을 만드는 것은 승리 조건이 아닙니다. 전략적으로 상대의 퇴로를 막으세요.</li>
                <li>한 턴에 한 칸씩 선을 따라 이동할 수 있습니다.</li>
                <li>자유로운 왕복 이동이 가능합니다.</li>
              </ul>
            </div>
          </div>
        )}

        {gameState.mode && (
          <div className="w-full flex flex-col items-center animate-fade-in-up">
            <div className="flex justify-between w-full px-4 mb-4 text-lg font-bold">
              <div className={`flex flex-col items-center p-2 rounded-lg transition-colors ${gameState.turn === 'white' ? 'bg-white/50 shadow-md ring-2 ring-[#8d6e63]' : ''}`}>
                <span className="text-sm text-gray-600 mb-1">백 (White)</span>
                <span className="text-2xl">{gameState.scores.white}</span>
              </div>
              <div className={`flex flex-col items-center p-2 rounded-lg transition-colors ${gameState.turn === 'black' ? 'bg-black/10 shadow-md ring-2 ring-[#3e2723]' : ''}`}>
                <span className="text-sm text-gray-600 mb-1">흑 (Black)</span>
                <span className="text-2xl">{gameState.scores.black}</span>
              </div>
            </div>

            <div className="mb-4 px-4 py-1 bg-[#5d4037] text-[#fdfbf7] rounded-full text-sm shadow-md">
              {gameState.winner 
                ? "게임 종료!" 
                : gameState.turn === 'white' ? "백 차례입니다" : "흑 차례입니다"}
            </div>

            <Board 
              board={gameState.board}
              onNodeClick={handleNodeClick}
              selectedPiece={gameState.selectedPiece}
              validMoves={currentValidDestinations}
              isHumanTurn={gameState.mode === GameMode.PvP || gameState.turn === 'white'}
            />

            <button 
              onClick={goHome}
              className="mt-6 text-[#5d4037] underline decoration-dotted hover:text-black opacity-60 hover:opacity-100 text-sm"
            >
              게임 종료하고 나가기
            </button>
          </div>
        )}
      </div>

      {gameState.winner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fff8e1] p-8 rounded-2xl shadow-2xl max-w-sm w-[90%] text-center border-4 border-[#5d4037]">
            <span className="text-6xl mb-4 block">🏆</span>
            <h2 className="text-4xl font-bold mb-2 text-[#3e2723] handwritten">
              {gameState.winner === 'white' ? '백 승리!' : '흑 승리!'}
            </h2>
            <p className="text-[#5d4037] mb-8 font-bold">
              상대방을 완벽하게 가두었습니다!
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={resetRound}
                className="w-full bg-[#8d6e63] hover:bg-[#795548] text-white py-3 rounded-xl shadow-md flex items-center justify-center gap-2 font-bold transition-transform active:scale-95"
              >
                🔄 한 판 더 하기
              </button>
              <button
                onClick={goHome}
                className="w-full bg-[#d7ccc8] hover:bg-[#bcaaa4] text-[#3e2723] py-3 rounded-xl shadow-md flex items-center justify-center gap-2 font-bold transition-transform active:scale-95"
              >
                🏠 첫 화면으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;