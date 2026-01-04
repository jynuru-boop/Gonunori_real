import { Point } from './types';

// Board Node Indices:
// Top Row: 0 (Left), 1 (Center), 2 (Right)
// Circle Top: 3
// Circle Left: 4
// Circle Center: 5
// Circle Right: 6
// Circle Bottom: 7
// Bottom Row: 8 (Left), 9 (Center), 10 (Right)

export const TOTAL_NODES = 11;

// Coordinates for rendering SVG (Canvas 400x500)
export const NODE_COORDINATES: Record<number, Point> = {
  0: { x: 50, y: 50 },
  1: { x: 200, y: 50 },
  2: { x: 350, y: 50 },
  3: { x: 200, y: 150 }, // Circle Top
  4: { x: 100, y: 250 }, // Circle Left
  5: { x: 200, y: 250 }, // Circle Center
  6: { x: 300, y: 250 }, // Circle Right
  7: { x: 200, y: 350 }, // Circle Bottom
  8: { x: 50, y: 450 },
  9: { x: 200, y: 450 },
  10: { x: 350, y: 450 },
};

// Adjacency List (Valid Moves)
export const ADJACENCY: Record<number, number[]> = {
  0: [1],
  1: [0, 2, 3],       // Top Center connects to Circle Top
  2: [1],
  3: [1, 4, 5, 6],    // Circle Top connects Up, Left, Center, Right
  4: [3, 5, 7],       // Circle Left
  5: [3, 4, 6, 7],    // Circle Center connects to all rim points
  6: [3, 5, 7],       // Circle Right
  7: [4, 5, 6, 9],    // Circle Bottom connects Left, Center, Right, Down
  8: [9],
  9: [7, 8, 10],      // Bottom Center connects Up, Left, Right
  10: [9],
};

// Initial Board Setup
export const INITIAL_BOARD = [
  'white', 'white', 'white', // 0, 1, 2
  null, null, null, null, null, // 3, 4, 5, 6, 7
  'black', 'black', 'black'  // 8, 9, 10
] as (import('./types').Player | null)[];