import React from 'react';
import { NODE_COORDINATES } from '../constants';
import { BoardState } from '../types';

interface BoardProps {
  board: BoardState;
  onNodeClick: (index: number) => void;
  selectedPiece: number | null;
  validMoves: number[]; 
  isHumanTurn: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onNodeClick, selectedPiece, validMoves, isHumanTurn }) => {
  
  const isValidDestination = (idx: number) => validMoves.includes(idx);

  return (
    <div className="relative w-full max-w-[400px] aspect-[4/5] mx-auto select-none">
      <svg viewBox="0 0 400 500" className="w-full h-full drop-shadow-xl">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="2" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Board Lines */}
        <g stroke="#3e2723" strokeWidth="6" strokeLinecap="round">
          <line x1="50" y1="50" x2="350" y2="50" />
          <line x1="50" y1="450" x2="350" y2="450" />
          <line x1="200" y1="50" x2="200" y2="450" />
          <line x1="100" y1="250" x2="300" y2="250" />
          <circle cx="200" cy="250" r="100" fill="none" />
        </g>

        {/* Nodes / Pieces */}
        {Object.entries(NODE_COORDINATES).map(([key, { x, y }]) => {
          const idx = parseInt(key);
          const piece = board[idx];
          const isSelected = selectedPiece === idx;
          const isDest = isValidDestination(idx);
          
          const isInteractive = isHumanTurn && (
            (piece && (piece === 'white')) || 
            (selectedPiece !== null && isDest)
          );

          return (
            <g 
              key={idx} 
              onClick={() => onNodeClick(idx)}
              className={isInteractive || isDest || (piece && isHumanTurn) ? "cursor-pointer" : "cursor-default"}
            >
              <circle cx={x} cy={y} r="35" fill="transparent" />
              <circle cx={x} cy={y} r="6" fill="#3e2723" />
              
              {isDest && (
                <circle 
                  cx={x} 
                  cy={y} 
                  r="15" 
                  fill="rgba(34, 197, 94, 0.5)" 
                  className="animate-pulse"
                />
              )}

              {isSelected && (
                <circle 
                  cx={x} 
                  cy={y} 
                  r="32" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="4" 
                  strokeDasharray="5,3"
                />
              )}

              {piece && (
                <g filter="url(#shadow)" className="transition-all duration-300 ease-in-out">
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="26" 
                    fill={piece === 'white' ? '#fdfbf7' : '#1a1a1a'} 
                    stroke={piece === 'white' ? '#e5e5e5' : '#000'}
                    strokeWidth="1"
                  />
                  <circle 
                    cx={x - 8} 
                    cy={y - 8} 
                    r="5" 
                    fill="white" 
                    opacity={piece === 'white' ? "0.8" : "0.3"} 
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Board;