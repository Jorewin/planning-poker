// a custom react context to store the session data with types from ../types

import React, { createContext, useContext, useMemo, useState } from "react";
import { CardValue, Game, GameRound, GameRoundResult, Vote } from "../types";
import { useUserContext } from "./UserContext";

interface SessionContextProps {
  game: Game | null;
  setGame: (game: Game | null) => void;
  currentRound: GameRound | null;
  setCurrentRound: (round: GameRound | null) => void;
  currentRoundResult: GameRoundResult | null;
  setCurrentRoundResult: (result: GameRoundResult | null) => void;
  currentVote: Vote | null;
  setVote: (cardValue: CardValue | null) => void;
}

export const SessionContext = createContext<SessionContextProps>({
  game: null,
  setGame: () => {},
  currentRound: null,
  setCurrentRound: () => {},
  currentRoundResult: null,
  setCurrentRoundResult: () => {},
  currentVote: null,
  setVote: () => {},
});

export const useSessionContext = () => useContext(SessionContext);

export const SessionProvider: React.FC = ({ children }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [currentRoundResult, setCurrentRoundResult] =
    useState<GameRoundResult | null>(null);
  const [currentVote, setCurrentVote] = useState<Vote | null>(null);
  const { user } = useUserContext();

  function setVote(cardValue: CardValue) {
    setCurrentVote({ cardValue: cardValue, userId: user?.id } as Vote);
  }

  const api = useMemo(() => {
    return {
      game,
      setGame,
      currentRound,
      setCurrentRound,
      currentRoundResult,
      setCurrentRoundResult,
      currentVote,
      setVote,
    };
  }, [game, currentRound, currentRoundResult, currentVote]);

  return (
    <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
  );
};
