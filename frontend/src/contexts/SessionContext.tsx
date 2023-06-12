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
  setVote: (cardValue: CardValue | null) => void;
  isGameActionDisabled: boolean;
  startNewGame: () => void;
  leaveGame: () => void;
  joinGame: (gameId: string) => void;
}

export const SessionContext = createContext<SessionContextProps>({
  game: null,
  currentVote: null,
  isGameActionDisabled: false,
  roundResult: null,
  players: [],
  setVote: () => {},
  startNewGame: () => {},
  leaveGame: () => {},
  joinGame: () => {},
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

  console.log("user", user); // user data is not null
  

  async function setVote(cardValue: CardValue) {
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

  async function startNewGame() {
    console.log(user); // null

    if (!user) return;

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
      users: [user],
      name: "My Game",
    });

    Cookies.set("gameId", gameId);
  }

  async function leaveGame() {
    if (!game || !user) return;

    setGame({
      ...game,
      users: [user],
    });

    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "leave_session",
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
        id: clientId,
      }),
    }).then((res) => res.json());

    if (!res.error) {
      setGame({
        id: gameId,
        code: gameId,
        users: [user],
        name: "My Game",
      });

      const selectionResponse = await getSelections();
    }
  }

  async function getSelections() {
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

      // await fetch("/rpc", {
      //   method: "POST",
      //   body: JSON.stringify({
      //     jsonrpc: "2.0",
      //     method: "reset_selection",
      //     id: clientId
      //   }),
      // });

      // console.log("reset selection");

      // setCurrentVote(null);
      return null;
    }

    return res.result;
  }

  // useEffect(() => {
  //   if (!game?.id) {
  //     fetch("/rpc", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         jsonrpc: "2.0",
  //         method: "leave_session",
  //       }),
  //     });
  //     // setCurrentVote(null);
  //     setRoundResult(null);
  //   }
  // }, [game]);

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
  }, [game, currentVote, isGameActionDisabled, roundResult]);

  useEffect(() => {
    const gameId = Cookies.get("gameId");
    if (gameId && user) {
      setGame({
        id: gameId,
        code: gameId,
        users: [user],
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
