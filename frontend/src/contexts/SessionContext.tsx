// a custom react context to store the session data with types from ../types

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  CardValue,
  Game,
  GameRound,
  GameRoundResult,
  GameStatus,
  Vote,
} from "../types";
import { useUserContext } from "./UserContext";
import { v4 as uuidv4 } from "uuid";

interface SessionContextProps {
  game: Game | null;
  currentRound: GameRound | null;
  currentRoundResult: GameRoundResult | null;
  currentVote: Vote | null;
  setVote: (cardValue: CardValue | null) => void;
  isGameActionDisabled: boolean;
  startRound: () => void;
  finishRound: () => void;
  startNewGame: () => void;
}

export const SessionContext = createContext<SessionContextProps>({
  game: null,
  currentRound: null,
  currentRoundResult: null,
  currentVote: null,
  setVote: () => {},
  isGameActionDisabled: false,
  startRound: () => {},
  finishRound: () => {},
  startNewGame: () => {},
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
    if (isGameActionDisabled) return;
    setCurrentVote({ cardValue: cardValue, userId: user?.id } as Vote);
    // update the votes in the current round (replace the current user's vote)
    const updatedVotes = currentRound?.votes.map((vote) => {
      if (vote.userId === user?.id) {
        return { ...vote, cardValue: cardValue };
      }
      return vote;
    });

    setCurrentRound({
      ...currentRound,
      votes: updatedVotes ? updatedVotes : [],
      result: null,
    });
  }

  function startRound() {
    if ((!game && !user) || game?.status === GameStatus.ROUND_IN_PROGRESS)
      return;

    const round = {
      gameId: game?.id,
      status: GameStatus.ROUND_IN_PROGRESS,
      votes: [],
      result: null,
    } as GameRound;

    setCurrentRound(round);
    setGame({
      ...game,
      status: GameStatus.ROUND_IN_PROGRESS,
      rounds: [...game?.rounds, round],
    });
  }

  function finishRound() {
    if (!currentRound) return;

    // average is closest fibonacci number to the average of all votes
    const average =
      currentRound?.votes.reduce((acc, vote) => acc + vote.cardValue, 0) /
      currentRound?.votes.length;

    // consensus is ratio of votes that are the same as the average
    const consensus =
      currentRound?.votes.filter((vote) => vote.cardValue === average).length /
      currentRound?.votes.length;

    const result = {
      average,
      consensus,
    } as GameRoundResult;

    setCurrentRoundResult(result);
    const rounds = game?.rounds.push(result);
    setGame({
      ...game,
      status: GameStatus.ROUND_FINISHED,
      roundResults
    });
  }

  function startNewGame() {
    setGame({
      id: uuidv4(),
      status: GameStatus.READY,
      rounds: [],
      code: "123456",
      users: [user],
      currentRound: null,
      name: "My Game",
    } as Game);
  }

  const isGameActionDisabled = useMemo(() => {
    return game?.status !== GameStatus.ROUND_IN_PROGRESS && !!user;
  }, [game, user]);

  const api = useMemo(() => {
    return {
      game,
      currentRound,
      currentRoundResult,
      currentVote,
      setVote,
      isGameActionDisabled,
      startRound,
      finishRound,
      startNewGame
    };
  }, [
    game,
    currentRound,
    currentRoundResult,
    currentVote,
    isGameActionDisabled,
  ]);

  return (
    <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
  );
};
