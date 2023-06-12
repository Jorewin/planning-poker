
import UserActions from "../components/UserActions";
import Cards from "../components/Cards";
import GameActions from "../components/GameActions";
import GameDetails from "../components/GameDetails";

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
      </div>
    </div>
  );
};

export default Game;
