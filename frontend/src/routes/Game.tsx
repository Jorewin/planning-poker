import Cards from "../components/Cards";
import UserInfo from "../components/UserInfo";
import GameDetails from "../components/GameDetails";
import { GamesList } from "../components/GamesList";
import GameActions from "../components/GameActions";
import { PlayersList } from "../components/PlayerSelections";
import { Stories } from "../components/Stories";

const Game = () => {
  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-4 w-4/5">
        <Cards />
        <Stories />
        <PlayersList />
      </div>
      <div className={`w-1/5 flex flex-col gap-4`}>
        <UserInfo />
        <GameActions />
        <GameDetails />
        <GamesList />
      </div>
    </div>
  );
};

export default Game;
