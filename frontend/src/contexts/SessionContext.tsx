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
  Story,
  Vote,
} from "../types";
import { useUserContext } from "./UserContext";
import { getClosestFibonacci } from "../utils";
import Cookies from "js-cookie";

interface SessionContextProps {
  game: Game | null;
  currentVote: Vote | null;
  roundResult: GameRoundResult | null;
  players: Player[];
  sessions: Game[];
  stories: Story[];
  activateGame: (gameId: string) => Promise<void>;
  setVote: (cardValue: CardValue | null) => Promise<void>;
  isGameActionDisabled: boolean;
  startNewGame: () => Promise<void>;
  leaveGame: () => Promise<void>;
  joinGame: (gameId: string) => Promise<void>;
  addStory: (summary: string, description: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  addTask: (
    storyId: string,
    summary: string,
    estimate: CardValue
  ) => Promise<void>;
  deleteTask: (storyId: string, taskId: string) => Promise<void>;
  forceSelection: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextProps>({
  game: null,
  currentVote: null,
  isGameActionDisabled: false,
  roundResult: null,
  players: [],
  sessions: [],
  stories: [],
  activateGame: async () => {},
  setVote: async () => {},
  startNewGame: async () => {},
  leaveGame: async () => {},
  joinGame: async () => {},
  addStory: async () => {},
  deleteStory: async () => {},
  addTask: async () => {},
  deleteTask: async () => {},
  forceSelection: async () => {},
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
  const [stories, setStories] = useState<Story[]>([]);
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
    const { players: playersResponse } = selections;
    const { stories: storiesResponse } = selections;

    setPlayers(playersResponse);

    if (JSON.stringify(stories) !== JSON.stringify(storiesResponse)) {
      setStories(storiesResponse);
    }

    if (playersResponse.every((s: any) => s.selection)) {
      const sum = playersResponse.reduce((acc: number, s: any) => acc + s.selection, 0);

      const average = Math.round(sum / playersResponse.length);
      const consensus = getClosestFibonacci(average);

      setRoundResult((prev) => ({
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

  const addStory = async (summary: string, description: string) => {
    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "create_story",
        id: clientId,
        params: [game?.id, summary, description],
      }),
    }).then((res) => res.json());

    if (res.error) return;

    setStories((prev) => [
      ...prev,
      {
        id: res.result,
        summary,
        description,
        tasks: [],
      },
    ]);
  };

  const deleteStory = async (id: string) => {
    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "delete_story",
        id: clientId,
        params: [id],
      }),
    }).then((res) => res.json());

    if (res.error) return;

    setStories((prev) => prev.filter((s) => s.id != id));
  };

  const addTask = async (
    storyId: string,
    summary: string,
    estimation: CardValue
  ) => {
    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "create_task",
        id: clientId,
        params: [storyId, summary, estimation],
      }),
    }).then((res) => res.json());

    if (res.error) return;

    setStories((prev) =>
      prev.map((s) =>
        s.id == storyId
          ? {
              ...s,
              tasks: [
                ...s.tasks,
                {
                  id: res.result,
                  summary,
                  estimation,
                },
              ],
            }
          : s
      )
    );

    return res.result;
  };

  const deleteTask = async (storyId: string, taskId: string) => {
    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "delete_task",
        id: clientId,
        params: [taskId],
      }),
    }).then((res) => res.json());

    if (res.error) return;

    setStories((prev) =>
      prev.map((s) =>
        s.id == storyId
          ? {
              ...s,
              tasks: s.tasks.filter((t) => t.id != taskId),
            }
          : s
      )
    );
  };

  const forceSelection = async () => {
    if(!game?.isOwner) return;

    const res = await fetch("/rpc", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "force_selections",
        id: clientId,
        params: [game?.id],
      }),
    }).then((res) => res.json());

    if (res.error) return;
  };

  const resetContext = () => {
    setGame(null);
    setStories([]);
    setPlayers([]);
    setRoundResult(null);
    setCurrentVote(null);
    setSessions([]);
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
      stories,
      addStory,
      activateGame,
      setVote,
      startNewGame,
      leaveGame,
      joinGame,
      deleteStory,
      addTask,
      deleteTask,
      forceSelection,
    };
  }, [
    game?.id,
    currentVote,
    isGameActionDisabled,
    roundResult,
    user,
    sessions,
    stories,
    setVote,
    startNewGame,
    leaveGame,
    joinGame,
    players,
  ]);

  useEffect(() => {
    resetContext();
    getSessions().then((sessions) => {
      // map through sessions and add isOwner property from user_is_owner field
      sessions = sessions.map((s: any) => ({
        ...s,
        isOwner: s.user_is_owner,
      }));
      setSessions(sessions);
    });
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
