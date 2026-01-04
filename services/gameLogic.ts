import { ADJACENCY, TOTAL_NODES } from '../constants';
import { BoardState, Player, Move } from '../types';

/**
 * Returns all valid moves for a given player on the current board.
 */
export const getValidMoves = (board: BoardState, player: Player): Move[] => {
  const moves: Move[] = [];
  for (let i = 0; i < TOTAL_NODES; i++) {
    if (board[i] === player) {
      const neighbors = ADJACENCY[i];
      for (const neighbor of neighbors) {
        if (board[neighbor] === null) {
          moves.push({ from: i, to: neighbor });
        }
      }
    }
  }
  return moves;
};

/**
 * Heuristic evaluation for AI.
 * Since the goal is only to block, we value mobility and central control.
 */
const evaluateBoard = (board: BoardState, aiPlayer: Player): number => {
  const opponent = aiPlayer === 'white' ? 'black' : 'white';
  
  const aiMoves = getValidMoves(board, aiPlayer).length;
  const oppMoves = getValidMoves(board, opponent).length;
  
  // Win/Loss terminal states
  if (oppMoves === 0) return 10000; // AI Wins
  if (aiMoves === 0) return -10000; // Opponent Wins

  let score = 0;

  // Primary Goal: Reduce opponent's mobility and increase our own
  score += (aiMoves * 20);
  score -= (oppMoves * 50);

  // Strategic position bonus: Central nodes are harder to escape from or block
  const centralNodes = [3, 4, 5, 6, 7];
  for (const idx of centralNodes) {
    if (board[idx] === aiPlayer) score += 30;
    if (board[idx] === opponent) score -= 30;
  }
  
  return score;
};

export const getBestMove = (
  board: BoardState, 
  player: Player, 
  depth: number = 4
): Move | null => {
  let bestScore = -Infinity;
  let bestMove = null;
  
  const moves = getValidMoves(board, player);
  if (moves.length === 0) return null;

  // Shuffle moves to avoid predictable play
  moves.sort(() => Math.random() - 0.5);

  for (const move of moves) {
    const newBoard = [...board];
    newBoard[move.to] = player;
    newBoard[move.from] = null;

    // Check if this move immediately traps the opponent
    if (getValidMoves(newBoard, player === 'white' ? 'black' : 'white').length === 0) {
      return move;
    }

    const score = minimax(newBoard, depth - 1, false, player, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

const minimax = (
  board: BoardState, 
  depth: number, 
  isMaximizing: boolean, 
  aiPlayer: Player,
  alpha: number,
  beta: number
): number => {
  const opponent = aiPlayer === 'white' ? 'black' : 'white';
  const currentPlayer = isMaximizing ? aiPlayer : opponent;
  const moves = getValidMoves(board, currentPlayer);

  // Terminal check: blocked means losing
  if (moves.length === 0) {
    return isMaximizing ? -10000 : 10000;
  }

  if (depth === 0) {
    return evaluateBoard(board, aiPlayer);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = [...board];
      newBoard[move.to] = aiPlayer;
      newBoard[move.from] = null;
      const evalScore = minimax(newBoard, depth - 1, false, aiPlayer, alpha, beta);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = [...board];
      newBoard[move.to] = opponent;
      newBoard[move.from] = null;
      const evalScore = minimax(newBoard, depth - 1, true, aiPlayer, alpha, beta);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};