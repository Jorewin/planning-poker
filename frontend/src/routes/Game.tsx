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

const Game = () => {
  const { user } = useUserContext();
  const {
    game,
    currentRound,
    currentRoundResult,
    currentVote,
    setCurrentRound,
    setCurrentRoundResult,
    setCurrentVote,
    setGame,
  } = useSessionContext();

  return (
    <div>
      <Rename />
      <div className="flex justify-center">
        <h1 className="text-2xl font-bold">Welcome {user?.username}!</h1>

        {CardValues.map((cardValue) => (
          <Card key={cardValue} cardValue={cardValue} />
        ))}
      </div>
    </div>
  );
};

export default Game;
