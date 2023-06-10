// a custom react context to store the session data with types from ../types

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CardValue,
  CardValues,
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
  leaveGame: () => void;
  joinGame: (gameId: string) => void;
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
  leaveGame: () => {},
  joinGame: () => {},
});

export const useSessionContext = () => useContext(SessionContext);

export const SessionProvider: React.FC = ({ children }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [currentRoundResult, setCurrentRoundResult] =
    useState<GameRoundResult | null>(null);
  const [currentVote, setCurrentVote] = useState<Vote | null>(null);
  const { user } = useUserContext();

  async function setVote(cardValue: CardValue) {
    if (isGameActionDisabled) return;

    if (cardValue) {
      await fetch("/rpc", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "make_selection",
          params: [cardValue],
        }),
      });

      const selectionResult = await fetch("/rpc", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "get_selection",
          id: user?.id,
        }),
      });

      const selectionsResult = await fetch("/rpc", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "get_selections",
          id: user?.id,
        }),
      });
    } else {
      await fetch("/rpc", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "reset_selection",
        }),
      });
    }

    setCurrentVote({ cardValue: cardValue, userId: user?.id } as Vote);
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
    setCurrentVote(null);
    setGame({
      ...game,
      status: GameStatus.ROUND_IN_PROGRESS,
    });
  }

  function finishRound() {
    if (!currentRound || !game) return;

    const average = Math.round(
      currentRound?.votes.reduce((acc, vote) => acc + vote.cardValue, 0) /
        currentRound?.votes.length
    );

    // now round the average to the closest fibonacci number
    const closestFibonacci = CardValues.reduce((prev, curr) =>
      Math.abs(curr - average) < Math.abs(prev - average) ? curr : prev
    );

    // consensus is ratio of votes that are the same as the average
    const consensus =
      currentRound?.votes.filter((vote) => vote.cardValue === average).length /
      currentRound?.votes.length;

    const result = {
      average: closestFibonacci,
      consensus,
    } as GameRoundResult;

    setCurrentRoundResult(result);
    setGame({
      ...game,
      status: GameStatus.READY,
      roundResults: [...game.roundResults, result],
    });
  }

  async function startNewGame() {
    const res = await fetch("/rpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "create_session",
        id: user?.id,
      }),
    });

    if (res.ok) {
      const resBody = await res.json();

      const newGame = {
        code: resBody.result,
        id: resBody.result,
        status: GameStatus.READY,
        rounds: [],
        users: [user],
        currentRound: null,
        name: "My Game",
        roundResults: [],
      } as Game;
      setGame(newGame);

      setCurrentVote(null);
    }
  }

  async function leaveGame() {
    if (!game || !user) return;

    const updatedUsers = game.users.filter((u) => u.id !== user.id);

    setGame({
      ...game,
      users: updatedUsers,
    });

    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "leave_session",
        id: user?.id,
      }),
    });

    if (res.ok) {
      setGame(null);
    }
  }

  async function joinGame(gameId: string) {
    if (!user) return;

    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "join_session",
        params: [Number(gameId)],
      }),
    });

    if (res.ok) {
      setGame({
        id: gameId,
        code: gameId,
        status: GameStatus.READY,
        rounds: [],
        users: [user],
        currentRound: null,
        name: "My Game",
        roundResults: [],
      });
    }      
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
      startNewGame,
      leaveGame,
      joinGame,
    };
  }, [
    game,
    currentRound,
    currentRoundResult,
    currentVote,
    isGameActionDisabled,
  ]);

  useEffect(() => {
    fetch("/rpc", {
      method: "POST",

      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "leave_session",
      }),
    });
  }, []);

  return (
    <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
  );
};
