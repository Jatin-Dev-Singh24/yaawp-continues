// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GameType,
  initTicTacToe,
  playTicTacToeMove,
  getTicTacToeBotMove,
  initRPS,
  playRPSMove,
  getRPSBotChoice,
  initConnectFour,
  playConnectFourMove,
  getConnectFourBotMove,
  initDotsAndBoxes,
  playDotsAndBoxesMove,
  getDotsAndBoxesBotMove,
} from '../utils/gameEngine';

interface ActiveGame {
  gameId: string;
  gameType: GameType;
  hostId: string;
  opponentId: string;
  state: any;
  status: 'active' | 'completed' | 'expired';
  updatedAt: number;
}

interface TemporaryGamesContextType {
  getActiveGame: (gameId: string) => ActiveGame | undefined;
  startOrGetGame: (gameId: string, gameType: GameType, hostId: string, opponentId: string) => ActiveGame;
  makePlayerMove: (gameId: string, moveData: any, isHost: boolean) => void;
  resetGame: (gameId: string) => void;
  expireGame: (gameId: string) => void;
}

const TemporaryGamesContext = createContext<TemporaryGamesContextType | null>(null);

export const TemporaryGamesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pure ephemeral in-memory state. NOT stored in localStorage or database.
  const [games, setGames] = useState<Record<string, ActiveGame>>({});

  // Auto-expire game sessions older than 15 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setGames(prev => {
        let changed = false;
        const next: Record<string, ActiveGame> = {};
        for (const [id, game] of Object.entries(prev) as [string, ActiveGame][]) {
          if (now - game.updatedAt < 15 * 60 * 1000 && game.status !== 'expired') {
            next[id] = game;
          } else {
            changed = true; // expired & evicted
          }
        }
        return changed ? next : prev;
      });
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const getActiveGame = useCallback((gameId: string) => {
    return games[gameId];
  }, [games]);

  const startOrGetGame = useCallback((
    gameId: string,
    gameType: GameType,
    hostId: string,
    opponentId: string
  ): ActiveGame => {
    if (games[gameId] && games[gameId].status !== 'expired') {
      return games[gameId];
    }

    let initialBoardState: any;
    switch (gameType) {
      case 'tictactoe':
        initialBoardState = initTicTacToe();
        break;
      case 'rps':
        initialBoardState = initRPS();
        break;
      case 'connect4':
        initialBoardState = initConnectFour();
        break;
      case 'dotsandboxes':
        initialBoardState = initDotsAndBoxes();
        break;
      default:
        initialBoardState = initTicTacToe();
    }

    const newGame: ActiveGame = {
      gameId,
      gameType,
      hostId,
      opponentId,
      state: initialBoardState,
      status: 'active',
      updatedAt: Date.now(),
    };

    setGames(prev => ({ ...prev, [gameId]: newGame }));
    return newGame;
  }, [games]);

  const makePlayerMove = useCallback((gameId: string, moveData: any, isHost: boolean) => {
    setGames(prev => {
      const current = prev[gameId];
      if (!current || current.status !== 'active') return prev;

      const playerRole: 'host' | 'opponent' = isHost ? 'host' : 'opponent';
      let nextState = { ...current.state };
      let newStatus: 'active' | 'completed' = 'active';

      switch (current.gameType) {
        case 'tictactoe': {
          nextState = playTicTacToeMove(nextState, moveData.index, playerRole);
          if (nextState.winner) newStatus = 'completed';
          break;
        }
        case 'rps': {
          nextState = playRPSMove(nextState, playerRole, moveData.choice);
          if (nextState.revealed) newStatus = 'completed';
          break;
        }
        case 'connect4': {
          nextState = playConnectFourMove(nextState, moveData.col, playerRole);
          if (nextState.winner) newStatus = 'completed';
          break;
        }
        case 'dotsandboxes': {
          nextState = playDotsAndBoxesMove(nextState, moveData.lineKey, playerRole);
          if (nextState.winner) newStatus = 'completed';
          break;
        }
      }

      const updatedGame: ActiveGame = {
        ...current,
        state: nextState,
        status: newStatus,
        updatedAt: Date.now(),
      };

      // If playing with opponent, simulate opponent's real-time turn if it is their turn now
      if (newStatus === 'active' && nextState.currentTurn === 'opponent') {
        setTimeout(() => {
          setGames(innerPrev => {
            const innerCurrent = innerPrev[gameId];
            if (!innerCurrent || innerCurrent.status !== 'active' || innerCurrent.state.currentTurn !== 'opponent') {
              return innerPrev;
            }

            let botState = { ...innerCurrent.state };
            let botStatus: 'active' | 'completed' = 'active';

            switch (innerCurrent.gameType) {
              case 'tictactoe': {
                const moveIdx = getTicTacToeBotMove(botState);
                if (moveIdx !== -1) {
                  botState = playTicTacToeMove(botState, moveIdx, 'opponent');
                  if (botState.winner) botStatus = 'completed';
                }
                break;
              }
              case 'rps': {
                const choice = getRPSBotChoice();
                botState = playRPSMove(botState, 'opponent', choice);
                if (botState.revealed) botStatus = 'completed';
                break;
              }
              case 'connect4': {
                const botCol = getConnectFourBotMove(botState);
                if (botCol !== -1) {
                  botState = playConnectFourMove(botState, botCol, 'opponent');
                  if (botState.winner) botStatus = 'completed';
                }
                break;
              }
              case 'dotsandboxes': {
                const botLine = getDotsAndBoxesBotMove(botState);
                if (botLine) {
                  botState = playDotsAndBoxesMove(botState, botLine, 'opponent');
                  if (botState.winner) botStatus = 'completed';
                }
                break;
              }
            }

            return {
              ...innerPrev,
              [gameId]: {
                ...innerCurrent,
                state: botState,
                status: botStatus,
                updatedAt: Date.now(),
              },
            };
          });
        }, 1100);
      }

      return {
        ...prev,
        [gameId]: updatedGame,
      };
    });
  }, []);

  const resetGame = useCallback((gameId: string) => {
    setGames(prev => {
      const current = prev[gameId];
      if (!current) return prev;

      let freshState: any;
      switch (current.gameType) {
        case 'tictactoe':
          freshState = initTicTacToe();
          break;
        case 'rps':
          freshState = initRPS();
          break;
        case 'connect4':
          freshState = initConnectFour();
          break;
        case 'dotsandboxes':
          freshState = initDotsAndBoxes();
          break;
        default:
          freshState = initTicTacToe();
      }

      return {
        ...prev,
        [gameId]: {
          ...current,
          state: freshState,
          status: 'active',
          updatedAt: Date.now(),
        },
      };
    });
  }, []);

  const expireGame = useCallback((gameId: string) => {
    setGames(prev => {
      const copy = { ...prev };
      delete copy[gameId]; // completely evicted from memory
      return copy;
    });
  }, []);

  return (
    <TemporaryGamesContext.Provider
      value={{
        getActiveGame,
        startOrGetGame,
        makePlayerMove,
        resetGame,
        expireGame,
      }}
    >
      {children}
    </TemporaryGamesContext.Provider>
  );
};

export const useTemporaryGames = () => {
  const context = useContext(TemporaryGamesContext);
  if (!context) {
    throw new Error('useTemporaryGames must be used within a TemporaryGamesProvider');
  }
  return context;
};
