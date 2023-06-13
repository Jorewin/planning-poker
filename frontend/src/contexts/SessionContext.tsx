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
  sessions: Game[];
  activateGame: (gameId: string) => Promise<void>;
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
  sessions: [],
  activateGame: async () => {},
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
  const [sessions, setSessions] = useState<Game[]>([]);
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
          params: [game?.id],
        }),
      });
      setCurrentVote(null);
    }
  };

  const startNewGame = async () => {
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
      isOwner: true,
    });

    setSessions([
      ...sessions,
      {
        id: gameId,
        isOwner: true,
      },
    ]);

    Cookies.set("gameId", gameId);
  };

  const leaveGame = async () => {
    if (!game || !user) return;

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
      Cookies.remove("gameId");
      // get sessions again
      const sessions = await getSessions();
      setSessions(sessions);
    }
  };

  const joinGame = async (gameId: string) => {
    if (!user) return;

    if (sessions.find((s) => s.id == gameId)) {
      activateGame(gameId);
      return;
    } else {
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
          isOwner: false,
        });

        setSessions([
          ...sessions,
          {
            id: gameId,
            isOwner: false,
          },
        ]);

        const selectionResponse = await getSelections();
      }
    }
  };

  const getSelections = async () => {
    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "get_session",
        id: clientId,
        params: [game?.id],
      }),
    }).then((res) => res.json());

    if (res.error) return;

    const selections = res.result;
    const { players } = selections;

    setPlayers(players);

    if (players.every((s: any) => s.selection)) {
      const sum = players.reduce((acc: number, s: any) => acc + s.selection, 0);

      const average = Math.round(sum / players.length);
      const consensus = getClosestFibonacci(average);

      setRoundResult((prev) => ({
        ...prev,
        consensus,
        average,
      }));

      return null;
    } else {
      setRoundResult(null);
    }

    return res.result;
  };

  const getSessions = async () => {
    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "get_sessions",
        id: clientId,
      }),
    }).then((res) => res.json());

    return res.result;
  };

  const activateGame = async (id: string) => {
    if (!user) return;

    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "get_session",
        id: clientId,
        params: [id],
      }),
    }).then((res) => res.json());

    if (res.error) return;

    // find me, and if I have a selection, set current vote
    if (
      res.result.players.find(
        (p: any) => p.username == user?.username && p.selection
      )
    ) {
      setCurrentVote({
        cardValue: res.result.players.find(
          (p: any) => p.username == user?.username
        ).selection,
        username: user.username,
      });
    }

    setGame(() => ({
      id,
      isOwner: res.result.user_is_owner,
    }));

    Cookies.set("gameId", id);
  };

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
      sessions,
      players,
      activateGame,
      setVote,
      startNewGame,
      leaveGame,
      joinGame,
    };
  }, [
    game?.id,
    currentVote,
    isGameActionDisabled,
    roundResult,
    user,
    sessions,
    setVote,
    startNewGame,
    leaveGame,
    joinGame,
    players,
  ]);

  useEffect(() => {
    const gameId = Cookies.get("gameId");
    getSessions().then((sessions) => {
      // map through sessions and add isOwner property from user_is_owner field
      sessions = sessions.map((s: any) => ({
        ...s,
        isOwner: s.user_is_owner,
      }));
      setSessions(sessions);
    });
    if (gameId && user) {
      setGame({
        id: gameId,
        isOwner: false,
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
