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
  GameRoundResult,
  Player,
  Vote,
} from "../types";
import { useUserContext } from "./UserContext";
import { v4 as uuidv4 } from "uuid";
import { getClosestFibonacci } from "../utils";
import Cookies from "js-cookie";

interface SessionContextProps {
  game: Game | null;
  currentVote: Vote | null;
  roundResult: GameRoundResult | null;
  players: Player[];
  setVote: (cardValue: CardValue | null) => Promise<void>;
  isGameActionDisabled: boolean;
  startNewGame: () => Promise<void>;
  leaveGame: () => Promise<void>;
  joinGame: (gameId: string) => Promise<void>;
}

export const SessionContext = createContext<SessionContextProps>({
  game: null,
  currentVote: null,
  isGameActionDisabled: false,
  roundResult: null,
  players: [],
  setVote: async () => {},
  startNewGame: async () => {},
  leaveGame: async () => {},
  joinGame: async () => {},
});

export const useSessionContext = () => useContext(SessionContext);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [game, setGame] = useState<Game | null>(null);
  const [currentVote, setCurrentVote] = useState<Vote | null>(null);
  const [roundResult, setRoundResult] = useState<GameRoundResult | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const { user, clientId } = useUserContext();

  const isGameActionDisabled = !game?.id || !user || currentVote?.cardValue;

  const setVote = async (cardValue: CardValue | null) => {
    if (!game || !user) return;

    if (cardValue) {
      const makeSelectionResullt = await fetch("/rpc", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "make_selection",
          params: [game?.id, cardValue],
          id: clientId,
        }),
      }).then((res) => res.json());

      if (makeSelectionResullt.error) return;

      const selections = await getSelections();
      setCurrentVote({ cardValue: cardValue, username: user.username });
    } else {
      const res = await fetch("/rpc", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "reset_selection",
          id: clientId,
          params: [game.id],
        }),
      });

      if (res.ok) {
        setCurrentVote(null);
      }
    }
  }

  const startNewGame = async () => {
    console.log(user);
    
    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "create_session",
        id: clientId,
      }),
    }).then((res) => res.json());

    if (res.error) return;

    const gameId = res.result;

    setGame({
      id: gameId,
      code: gameId,
      name: "My Game",
    });

    Cookies.set("gameId", gameId);
  }

  const leaveGame = async () => {
    if (!game || !user) return;

    setGame({
      ...game,
    });

    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "leave_session",
        params: [game.id],
      }),
    });

    if (res.ok) {
      setGame(null);
    }
  }

  const joinGame = async (gameId: string) => {
    if (!user) return;

    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "join_session",
        params: [Number(gameId)],
        id: clientId,
      }),
    }).then((res) => res.json());

    if (!res.error) {
      setGame({
        id: gameId,
        code: gameId,
        name: "My Game",
      });

      const selectionResponse = await getSelections();
    }
  }

  const getSelections = async () => {
    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "get_selections",
        id: clientId,
        params: [game?.id],
      }),
    }).then((res) => res.json());

    const selections = res.result;

    if (selections.every((s: any) => s.selection)) {
      const sum = selections.reduce(
        (acc: number, s: any) => acc + s.selection,
        0
      );

      const average = Math.round(sum / selections.length);
      const consensus = getClosestFibonacci(average);

      setRoundResult((prev) => ({
        ...prev,
        consensus,
        average,
      }));

      return null;
    }

    return res.result;
  }
  
  useEffect(() => {
    if (!game?.id) return;
    const interval = setInterval(() => {
      getSelections();
    }, 1500);

    return () => clearInterval(interval);
  }, [game?.id]);

  const api = useMemo(() => {
    return {
      game,
      currentVote,
      isGameActionDisabled,
      roundResult,
      setVote,
      startNewGame,
      leaveGame,
      joinGame,
    };
  }, [game, currentVote, isGameActionDisabled, roundResult, user]);

  useEffect(() => {
    const gameId = Cookies.get("gameId");
    if (gameId && user) {
      setGame({
        id: gameId,
        code: gameId,
        name: "My Game",
      });
    }
  }, [user]);

  // reset game cookie when game is left
  useEffect(() => {
    if (!game?.id) {
      Cookies.remove("gameId");
    }
  }, [game?.id]);

  return (
    <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
  );
};
