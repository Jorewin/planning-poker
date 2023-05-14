import { useSessionContext } from "../contexts/SessionContext";
import { GameStatusMessage } from "../types";

const GameDetails = () => {
  const { game, setGame, startRound } = useSessionContext();

  return (
    <div className="flex flex-col border-4 rounded-lg p-4 gap-2">
      <div>
        Game code:
        <span className="font-bold text-green-500">&nbsp;{game?.code}</span>
      </div>
      {GameStatusMessage[game?.status] || GameStatusMessage.NOT_READY}
    </div>
  );
};

export default GameDetails;
