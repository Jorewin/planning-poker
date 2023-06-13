import { useSessionContext } from "../contexts/SessionContext";
import { Game } from "../types";

export function GamesList() {
  const { sessions, activateGame } = useSessionContext();

  return (
    // a list of games with tailwind
    <div className="flex flex-col border-4 rounded-lg p-4 gap-2 max-h-80 overflow-y-auto">
      <p className="text-center font-bold">Active Games</p>
      {sessions.map((game: Game) => (
        <div className="flex justify-between items-center pt-2 border-t-2">
          {game.id} - {game.isOwner ? "Owner" : "Player"}
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded-md"
            onClick={() => activateGame(game.id)}
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
}
