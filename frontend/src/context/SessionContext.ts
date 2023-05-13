// a custom react context to store the session data with types from ../types

import React from "react";
import { Game, GameRound, GameRoundResult, Vote } from "../types";

export interface SessionContextType {
  game: Game | null;
  setGame: (game: Game | null) => void;
  currentRound: GameRound | null;
  setCurrentRound: (round: GameRound | null) => void;
  currentRoundResult: GameRoundResult | null;
  setCurrentRoundResult: (result: GameRoundResult | null) => void;
  currentVote: Vote | null;
  setCurrentVote: (vote: Vote | null) => void;
}

export const SessionContext = React.createContext<SessionContextType>({
  game: null,
  setGame: () => {},
  currentRound: null,
  setCurrentRound: () => {},
  currentRoundResult: null,
  setCurrentRoundResult: () => {},
  currentVote: null,
  setCurrentVote: () => {},
});

export function useGameSession() {
  const [game, setGame] = React.useState<Game | null>(null);
  const [currentRound, setCurrentRound] = React.useState<GameRound | null>(
    null
  );
  const [
    currentRoundResult,
    setCurrentRoundResult,
  ] = React.useState<GameRoundResult | null>(null);
  const [currentVote, setCurrentVote] = React.useState<Vote | null>(null);

  return {
    game,
    setGame,
    currentRound,
    setCurrentRound,
    currentRoundResult,
    setCurrentRoundResult,
    currentVote,
    setCurrentVote,
  };
}