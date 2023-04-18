import React from "react";
import GameSession from "./routes/GameSession"
import Timer from "./components/Timer";

export default function App() {
  function handleVote(cardValue: number) {
    console.log(cardValue);
  }

  return (
    <>
      <GameSession />
    </>
  );
}
