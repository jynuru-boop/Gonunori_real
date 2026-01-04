export type Player = 'white' | 'black';
export type BoardState = (Player | null)[];

export enum GameMode {
  PvP = 'PvP',
  PvAI = 'PvAI',
}

export interface Move {
  from: number;
  to: number;
}

export interface GameState {
  board: BoardState;
  turn: Player;
  selectedPiece: number | null;
  winner: Player | null;
  mode: GameMode | null;
  scores: { white: number; black: number };
  gameStarted: boolean;
}

export interface Point {
  x: number;
  y: number;
}