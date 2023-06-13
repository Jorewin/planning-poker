import { useEffect, useState } from "react";
import { useSessionContext } from "../contexts/SessionContext";
import { useUserContext } from "../contexts/UserContext";
import { Player } from "../types";
import { getRandomEmoji } from "../utils";

function PlayerCard({ player }: { player: Player }) {
  const { user } = useUserContext();
  const [randomEmoji, setEmoji] = useState(getRandomEmoji());

  const changeEmoji = () => {
    setEmoji(getRandomEmoji());
  };

  return (
    <div
      className={`flex flex-col gap-2 p-4 rounded-md text-white text-center ${
        player.username === user?.username ? "bg-green-500" : "bg-gray-500"
      }`}
      onClick={changeEmoji}
    >
      <div className="text-xl">
        {player.username} {randomEmoji}
      </div>
      <div className="text-2xl font-bold">
        {player.selection ? player.selection : "-"}
      </div>
    </div>
  );
}

export function PlayersList() {
  const { game, players } = useSessionContext();
  const { user } = useUserContext();

  if (!game) {
    return null;
  }

  return (
    <div className="flex gap-4">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
