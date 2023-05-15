import { useSessionContext } from "../contexts/SessionContext";
import { GameStatusMessage } from "../types";

const Rounds = () => {
  const { game } = useSessionContext();

  return (
    <div className="flex flex-col border-4 rounded-lg p-4 gap-2">
      {game?.roundResults.map((round, index) => (
        <div key={index}>
          Round {index + 1}:
          <span className="font-bold text-green-500">
            &nbsp;{round.average}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Rounds;
