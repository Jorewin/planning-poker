
import UserActions from "../components/UserActions";
import Cards from "../components/Cards";
import GameActions from "../components/GameActions";
import GameDetails from "../components/GameDetails";
import { GamesList } from "../components/GamesList";

const Game = () => {

  return (
    <div className="flex">
      <div className="w-4/5">
        <Cards />
      </div>
      <div className={`w-1/5 flex flex-col gap-4`}>
        <UserActions />
        <GameActions />
        <GameDetails />
        <GamesList />
      </div>
    </div>
  );
};

export default Game;
