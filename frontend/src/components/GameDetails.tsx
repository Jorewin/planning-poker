import { useSessionContext } from "../contexts/SessionContext";

const GameDetails = () => {
  const { game, roundResult } = useSessionContext();

  return (
    <div className="flex flex-col border-4 rounded-lg p-4 gap-2">
      <div>
        Game code:
        <span className="font-bold text-green-500">&nbsp;{game?.id}</span>
      </div>
      <div>
        Latest consensus:
        <span className="font-bold text-green-500">
          &nbsp;{roundResult?.consensus}
        </span>
      </div>
      {game?.isOwner && <div className="font-bold text-green-500">You are the owner 👑</div>}
    </div>
  );
};

export default GameDetails;
