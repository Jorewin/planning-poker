import { useMemo } from "react";
import { useSessionContext } from "../contexts/SessionContext";
import { CardValues, GameStatus, GameStatusMessage } from "../types";
import Card from "./Card";

const GameActions = () => {
  const { game, startRound, startNewGame, finishRound } = useSessionContext();
  const { isGameActionDisabled: isDisabled } = useSessionContext();

  const canStartRound = game?.status === GameStatus.READY || game?.status === GameStatus.ROUND_FINISHED;
  const canFinishRound = game?.status === GameStatus.ROUND_IN_PROGRESS;

  return (
    <div className="flex flex-col border-4 rounded-lg p-4 gap-2">
      <button
        className="border rounded-lg px-2 py-1 bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={startNewGame}
      >
        New Game
      </button>
      {canStartRound && (
        <button
          className="border rounded-lg px-2 py-1 bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={startRound}
        >
          Start Round
        </button>
      )}
      {canFinishRound && (
        <button
          className="border rounded-lg px-2 py-1 bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={finishRound}
        >
          Finish Round
        </button>
      )}
    </div>
  );
};

export default GameActions;
