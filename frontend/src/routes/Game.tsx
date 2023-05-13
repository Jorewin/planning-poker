// import React, { useState } from "react";
// import Header from "../components/Header";
// import Login from "./Login";
// import Cards from "../components/Cards";
// import Timer from "../components/Timer";
// import Results from "../components/Results";
import { useUserContext } from "../contexts/UserContext";
import { useSessionContext } from "../contexts/SessionContext";

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-100 p-4 flex justify-center">
        <h1 className="text-2xl font-bold">Welcome {user?.username}!</h1>
      </div>
    </div>
  );
};

export default Game;
