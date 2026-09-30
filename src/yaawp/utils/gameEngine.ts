// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
// Lightweight, temporary, native multiplayer game logic for YAAWP
// Game sessions use only ephemeral memory state during active play and are discarded when finished.

export type GameType = 'tictactoe' | 'rps' | 'connect4' | 'dotsandboxes';

// ========================
// 1. TIC-TAC-TOE
// ========================
export interface TicTacToeState {
  board: (string | null)[]; // 9 cells
  currentTurn: 'host' | 'opponent';
  winner: 'host' | 'opponent' | 'draw' | null;
  winningLine: number[] | null;
  hostSymbol: 'X';
  opponentSymbol: 'O';
}

export function initTicTacToe(): TicTacToeState {
  return {
    board: Array(9).fill(null),
    currentTurn: 'host',
    winner: null,
    winningLine: null,
    hostSymbol: 'X',
    opponentSymbol: 'O',
  };
}

const TTT_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diags
];

export function playTicTacToeMove(
  state: TicTacToeState,
  index: number,
  player: 'host' | 'opponent'
): TicTacToeState {
  if (state.winner || state.board[index] !== null || state.currentTurn !== player) {
    return state;
  }

  const symbol = player === 'host' ? state.hostSymbol : state.opponentSymbol;
  const newBoard = [...state.board];
  newBoard[index] = symbol;

  // Check win
  for (const line of TTT_LINES) {
    const [a, b, c] = line;
    if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
      return {
        ...state,
        board: newBoard,
        winner: player,
        winningLine: line,
      };
    }
  }

  // Check draw
  if (newBoard.every(cell => cell !== null)) {
    return {
      ...state,
      board: newBoard,
      winner: 'draw',
      winningLine: null,
    };
  }

  return {
    ...state,
    board: newBoard,
    currentTurn: player === 'host' ? 'opponent' : 'host',
  };
}

export function getTicTacToeBotMove(state: TicTacToeState): number {
  const emptyIndices = state.board
    .map((val, idx) => (val === null ? idx : null))
    .filter((v): v is number => v !== null);

  if (emptyIndices.length === 0) return -1;

  // 1. Try to win
  for (const idx of emptyIndices) {
    const boardCopy = [...state.board];
    boardCopy[idx] = state.opponentSymbol;
    for (const [a, b, c] of TTT_LINES) {
      if (boardCopy[a] === state.opponentSymbol && boardCopy[b] === state.opponentSymbol && boardCopy[c] === state.opponentSymbol) {
        return idx;
      }
    }
  }

  // 2. Block host win
  for (const idx of emptyIndices) {
    const boardCopy = [...state.board];
    boardCopy[idx] = state.hostSymbol;
    for (const [a, b, c] of TTT_LINES) {
      if (boardCopy[a] === state.hostSymbol && boardCopy[b] === state.hostSymbol && boardCopy[c] === state.hostSymbol) {
        return idx;
      }
    }
  }

  // 3. Take center if available
  if (emptyIndices.includes(4)) return 4;

  // 4. Random available
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

// ========================
// 2. ROCK PAPER SCISSORS
// ========================
export type RPSChoice = 'rock' | 'paper' | 'scissors';

export interface RPSState {
  hostChoice: RPSChoice | null;
  opponentChoice: RPSChoice | null;
  revealed: boolean;
  winner: 'host' | 'opponent' | 'draw' | null;
  hostScore: number;
  opponentScore: number;
  round: number;
}

export function initRPS(): RPSState {
  return {
    hostChoice: null,
    opponentChoice: null,
    revealed: false,
    winner: null,
    hostScore: 0,
    opponentScore: 0,
    round: 1,
  };
}

export function playRPSMove(
  state: RPSState,
  player: 'host' | 'opponent',
  choice: RPSChoice
): RPSState {
  const next = { ...state };
  if (player === 'host') next.hostChoice = choice;
  if (player === 'opponent') next.opponentChoice = choice;

  // If both have chosen, evaluate round
  if (next.hostChoice && next.opponentChoice) {
    next.revealed = true;
    if (next.hostChoice === next.opponentChoice) {
      next.winner = 'draw';
    } else if (
      (next.hostChoice === 'rock' && next.opponentChoice === 'scissors') ||
      (next.hostChoice === 'paper' && next.opponentChoice === 'rock') ||
      (next.hostChoice === 'scissors' && next.opponentChoice === 'paper')
    ) {
      next.winner = 'host';
      next.hostScore += 1;
    } else {
      next.winner = 'opponent';
      next.opponentScore += 1;
    }
  }

  return next;
}

export function getRPSBotChoice(): RPSChoice {
  const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
  return choices[Math.floor(Math.random() * choices.length)];
}

// ========================
// 3. CONNECT 4
// ========================
export const C4_ROWS = 6;
export const C4_COLS = 7;

export interface ConnectFourState {
  grid: (string | null)[][]; // 6 rows x 7 cols
  currentTurn: 'host' | 'opponent';
  winner: 'host' | 'opponent' | 'draw' | null;
  winningSlots: [number, number][] | null; // row, col
  lastDrop: { row: number; col: number } | null;
}

export function initConnectFour(): ConnectFourState {
  const grid: (string | null)[][] = Array(C4_ROWS)
    .fill(null)
    .map(() => Array(C4_COLS).fill(null));
  return {
    grid,
    currentTurn: 'host',
    winner: null,
    winningSlots: null,
    lastDrop: null,
  };
}

export function playConnectFourMove(
  state: ConnectFourState,
  col: number,
  player: 'host' | 'opponent'
): ConnectFourState {
  if (state.winner || state.currentTurn !== player || col < 0 || col >= C4_COLS) {
    return state;
  }

  // Find lowest empty row in col
  let targetRow = -1;
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (state.grid[r][col] === null) {
      targetRow = r;
      break;
    }
  }

  if (targetRow === -1) return state; // column full

  const newGrid = state.grid.map(row => [...row]);
  newGrid[targetRow][col] = player;

  // Check 4-in-a-row from targetRow, col
  const win = checkConnectFourWin(newGrid, targetRow, col, player);
  if (win) {
    return {
      ...state,
      grid: newGrid,
      winner: player,
      winningSlots: win,
      lastDrop: { row: targetRow, col },
    };
  }

  // Check board full (draw)
  const isFull = newGrid[0].every(c => c !== null);
  if (isFull) {
    return {
      ...state,
      grid: newGrid,
      winner: 'draw',
      winningSlots: null,
      lastDrop: { row: targetRow, col },
    };
  }

  return {
    ...state,
    grid: newGrid,
    currentTurn: player === 'host' ? 'opponent' : 'host',
    lastDrop: { row: targetRow, col },
  };
}

function checkConnectFourWin(
  grid: (string | null)[][],
  r: number,
  c: number,
  player: string
): [number, number][] | null {
  const directions = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal \
    [1, -1], // diagonal /
  ];

  for (const [dr, dc] of directions) {
    const line: [number, number][] = [[r, c]];

    // forward
    for (let step = 1; step < 4; step++) {
      const nr = r + dr * step;
      const nc = c + dc * step;
      if (nr >= 0 && nr < C4_ROWS && nc >= 0 && nc < C4_COLS && grid[nr][nc] === player) {
        line.push([nr, nc]);
      } else {
        break;
      }
    }

    // backward
    for (let step = 1; step < 4; step++) {
      const nr = r - dr * step;
      const nc = c - dc * step;
      if (nr >= 0 && nr < C4_ROWS && nc >= 0 && nc < C4_COLS && grid[nr][nc] === player) {
        line.push([nr, nc]);
      } else {
        break;
      }
    }

    if (line.length >= 4) {
      return line.slice(0, 4);
    }
  }

  return null;
}

export function getConnectFourBotMove(state: ConnectFourState): number {
  const validCols: number[] = [];
  for (let c = 0; c < C4_COLS; c++) {
    if (state.grid[0][c] === null) validCols.push(c);
  }
  if (validCols.length === 0) return -1;

  // 1. Can opponent win in one move?
  for (const c of validCols) {
    let r = -1;
    for (let row = C4_ROWS - 1; row >= 0; row--) {
      if (state.grid[row][c] === null) {
        r = row;
        break;
      }
    }
    if (r !== -1) {
      const copy = state.grid.map(rw => [...rw]);
      copy[r][c] = 'opponent';
      if (checkConnectFourWin(copy, r, c, 'opponent')) return c;
    }
  }

  // 2. Can block host win in one move?
  for (const c of validCols) {
    let r = -1;
    for (let row = C4_ROWS - 1; row >= 0; row--) {
      if (state.grid[row][c] === null) {
        r = row;
        break;
      }
    }
    if (r !== -1) {
      const copy = state.grid.map(rw => [...rw]);
      copy[r][c] = 'host';
      if (checkConnectFourWin(copy, r, c, 'host')) return c;
    }
  }

  // Prefer center columns (3, 2, 4)
  const preferred = [3, 2, 4, 1, 5, 0, 6];
  for (const p of preferred) {
    if (validCols.includes(p)) return p;
  }

  return validCols[Math.floor(Math.random() * validCols.length)];
}

// ========================
// 4. DOTS & BOXES
// ========================
// 4x4 dots = 3x3 boxes (9 boxes total)
// Horizontal lines: 4 rows x 3 cols = 12 lines
// Vertical lines: 3 rows x 4 cols = 12 lines
export interface DotsAndBoxesState {
  // key: "h_r_c" for horizontal line at row r, col c
  // key: "v_r_c" for vertical line at row r, col c
  claimedLines: Record<string, 'host' | 'opponent'>;
  // key: "box_r_c" for box at row r, col c (0..2)
  capturedBoxes: Record<string, 'host' | 'opponent'>;
  currentTurn: 'host' | 'opponent';
  hostScore: number;
  opponentScore: number;
  winner: 'host' | 'opponent' | 'draw' | null;
}

export function initDotsAndBoxes(): DotsAndBoxesState {
  return {
    claimedLines: {},
    capturedBoxes: {},
    currentTurn: 'host',
    hostScore: 0,
    opponentScore: 0,
    winner: null,
  };
}

export function playDotsAndBoxesMove(
  state: DotsAndBoxesState,
  lineKey: string,
  player: 'host' | 'opponent'
): DotsAndBoxesState {
  if (state.winner || state.claimedLines[lineKey] || state.currentTurn !== player) {
    return state;
  }

  const newClaimed = { ...state.claimedLines, [lineKey]: player };
  const newCaptured = { ...state.capturedBoxes };
  let completedCount = 0;

  // Check 3x3 boxes
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const boxKey = `box_${r}_${c}`;
      if (!newCaptured[boxKey]) {
        const top = `h_${r}_${c}`;
        const bottom = `h_${r + 1}_${c}`;
        const left = `v_${r}_${c}`;
        const right = `v_${r}_${c + 1}`;

        if (newClaimed[top] && newClaimed[bottom] && newClaimed[left] && newClaimed[right]) {
          newCaptured[boxKey] = player;
          completedCount += 1;
        }
      }
    }
  }

  const newHostScore = state.hostScore + (player === 'host' ? completedCount : 0);
  const newOpponentScore = state.opponentScore + (player === 'opponent' ? completedCount : 0);

  // If all 9 boxes completed, game over
  const totalBoxes = Object.keys(newCaptured).length;
  let winner = state.winner;
  if (totalBoxes >= 9) {
    if (newHostScore > newOpponentScore) winner = 'host';
    else if (newOpponentScore > newHostScore) winner = 'opponent';
    else winner = 'draw';
  }

  return {
    ...state,
    claimedLines: newClaimed,
    capturedBoxes: newCaptured,
    hostScore: newHostScore,
    opponentScore: newOpponentScore,
    winner,
    // Bonus turn if player completed at least one box, otherwise switch turn
    currentTurn: completedCount > 0 ? player : player === 'host' ? 'opponent' : 'host',
  };
}

export function getDotsAndBoxesBotMove(state: DotsAndBoxesState): string | null {
  // Collect all available lines
  const allLines: string[] = [];

  // Horizontal lines: 4 rows x 3 cols
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      const k = `h_${r}_${c}`;
      if (!state.claimedLines[k]) allLines.push(k);
    }
  }

  // Vertical lines: 3 rows x 4 cols
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const k = `v_${r}_${c}`;
      if (!state.claimedLines[k]) allLines.push(k);
    }
  }

  if (allLines.length === 0) return null;

  // 1. Can we complete a box?
  for (const line of allLines) {
    const testLines = { ...state.claimedLines, [line]: 'opponent' };
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (!state.capturedBoxes[`box_${r}_${c}`]) {
          const top = `h_${r}_${c}`;
          const bottom = `h_${r + 1}_${c}`;
          const left = `v_${r}_${c}`;
          const right = `v_${r}_${c + 1}`;
          if (testLines[top] && testLines[bottom] && testLines[left] && testLines[right]) {
            return line;
          }
        }
      }
    }
  }

  // 2. Avoid giving a 3rd line to a box if possible
  const safeLines = allLines.filter(line => {
    const testLines = { ...state.claimedLines, [line]: 'opponent' };
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (!state.capturedBoxes[`box_${r}_${c}`]) {
          const top = `h_${r}_${c}`;
          const bottom = `h_${r + 1}_${c}`;
          const left = `v_${r}_${c}`;
          const right = `v_${r}_${c + 1}`;
          const count = [testLines[top], testLines[bottom], testLines[left], testLines[right]].filter(Boolean).length;
          if (count === 3) return false; // creates an easy capture for opponent
        }
      }
    }
    return true;
  });

  if (safeLines.length > 0) {
    return safeLines[Math.floor(Math.random() * safeLines.length)];
  }

  return allLines[Math.floor(Math.random() * allLines.length)];
}
