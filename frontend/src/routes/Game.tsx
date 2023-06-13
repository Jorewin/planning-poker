// import React, { useState } from "react";
// import Header from "../components/Header";
// import Login from "./Login";
// import Cards from "../components/Cards";
// import Timer from "../components/Timer";
// import Results from "../components/Results";
import { useUserContext } from "../contexts/UserContext";
import { useSessionContext } from "../contexts/SessionContext";
import Rename from "../components/Rename";
import Card from "../components/Card";
import { CardValues } from "../types";
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
        <Rename />
        <GameActions />
        <GameDetails />
      </div>
    </div>
  );
};

export default Game;
