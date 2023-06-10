import { useMemo, useState } from "react";
import { useSessionContext } from "../contexts/SessionContext";
import { CardValues, GameStatus, GameStatusMessage } from "../types";
import Card from "./Card";

function JoinGame() {
  const { joinGame, startNewGame } = useSessionContext();
  const [gameId, setGameId] = useState("");

  return (
    <>
      <button
        className="border rounded-lg px-2 py-1 bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={startNewGame}
      >
        New Game
      </button>
      <div className="flex flex-row justify-center">or</div>
      <hr />
      <input
        className="border rounded-lg px-2 py-1"
        placeholder="Game ID"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
      />
      <button
        className="border rounded-lg px-2 py-1 bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => joinGame(gameId)}
      >
        Join Game
      </button>
    </>
  );
}

const GameActions = () => {
  const {
    game,
    leaveGame,
    currentVote,
    setVote,
  } = useSessionContext();
  const { isGameActionDisabled } = useSessionContext();

  const canLeaveGame = !!game;
  const canClearVote = !isGameActionDisabled && currentVote?.cardValue;

  return (
    <div className="flex flex-col border-4 rounded-lg p-4 gap-2">
      {!game && <JoinGame />}
      {canClearVote && (
        // clear the selection button
        <button
          className="border rounded-lg px-2 py-1 bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setVote(null)}
        >
          Clear Selection
        </button>
      )}
      {canLeaveGame && (
        <button
          className="border rounded-lg px-2 py-1 bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={leaveGame}
        >
          Leave Game
        </button>
      )}
    </div>
  );
};

export default GameActions;
