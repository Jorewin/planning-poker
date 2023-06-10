// a custom react context to store the session data with types from ../types

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CardValue, CardValues, Game, GameStatus, Vote } from "../types";
import { useUserContext } from "./UserContext";
import { v4 as uuidv4 } from "uuid";

interface SessionContextProps {
  game: Game | null;
  currentVote: Vote | null;
  setVote: (cardValue: CardValue | null) => void;
  isGameActionDisabled: boolean;
  startNewGame: () => void;
  leaveGame: () => void;
  joinGame: (gameId: string) => void;
}

export const SessionContext = createContext<SessionContextProps>({
  game: null,
  currentVote: null,
  setVote: () => {},
  isGameActionDisabled: false,
  startNewGame: () => {},
  leaveGame: () => {},
  joinGame: () => {},
});

export const useSessionContext = () => useContext(SessionContext);

export const SessionProvider: React.FC = ({ children }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [currentVote, setCurrentVote] = useState<Vote | null>(null);
  const { user } = useUserContext();

  const isGameActionDisabled = !game?.id && !!user && !currentVote?.cardValue;

  async function setVote(cardValue: CardValue) {
    if (isGameActionDisabled) return;

    if (cardValue) {
      await fetch("/rpc", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "make_selection",
          params: [cardValue],
          id: user?.id,
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
          id: user?.id,
        }),
      });
    }

    setCurrentVote({ cardValue: cardValue, userId: user?.id } as Vote);
  }

  async function startNewGame() {
    if(!user) return;

    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "create_session",
        id: user?.id,
      }),
    }).then((res) => res.json());

    const gameId = res.result;

    setGame({
      id: gameId,
      code: gameId,
      users: [user],
      name: "My Game",
      roundResults: [],
    });
    
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
        id: user?.id,
      }),
    });

    if (res.ok) {
      setGame({
        id: gameId,
        code: gameId,
        users: [user],
        name: "My Game",
        roundResults: [],
      });

      const selectionResult = await fetch("/rpc", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "get_selections",
          id: user?.id,
        }),
      });
    }
  }

  const api = useMemo(() => {
    return {
      game,
      currentVote,
      setVote,
      isGameActionDisabled,
      startNewGame,
      leaveGame,
      joinGame,
    };
  }, [game, currentVote, isGameActionDisabled]);

  useEffect(() => {
    fetch("/rpc", {
      method: "POST",

      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "leave_session",
        id: user?.id,
      }),
    });
  }, []);

  return (
    <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
  );
};
