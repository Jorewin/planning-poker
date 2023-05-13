// a custom react context to store the session data with types from ../types

import React, { createContext, useContext, useMemo, useState } from "react";
import { Game, GameRound, GameRoundResult, Vote } from "../types";

interface SessionContextProps {
  game: Game | null;
  setGame: (game: Game | null) => void;
  currentRound: GameRound | null;
  setCurrentRound: (round: GameRound | null) => void;
  currentRoundResult: GameRoundResult | null;
  setCurrentRoundResult: (result: GameRoundResult | null) => void;
  currentVote: Vote | null;
  setCurrentVote: (vote: Vote | null) => void;
}

export const SessionContext = createContext<SessionContextProps>({
  game: null,
  setGame: () => {},
  currentRound: null,
  setCurrentRound: () => {},
  currentRoundResult: null,
  setCurrentRoundResult: () => {},
  currentVote: null,
  setCurrentVote: () => {},
});

export const useSessionContext = () => useContext(SessionContext);

export const SessionProvider: React.FC = ({ children }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [currentRoundResult, setCurrentRoundResult] =
    useState<GameRoundResult | null>(null);
  const [currentVote, setCurrentVote] = useState<Vote | null>(null);

  const api = useMemo(() => {
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
  }, [game, currentRound, currentRoundResult, currentVote]);

  return (
    <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
  );
};
