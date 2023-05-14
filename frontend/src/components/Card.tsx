import { useState } from "react";
import { CardValue, Vote } from "../types";
import { useSessionContext } from "../contexts/SessionContext";
type CardProps = {
  cardValue: CardValue;
};

function Card({ cardValue }: CardProps) {
  const { currentVote, setVote } = useSessionContext();

  function handleSelect() {
    if (currentVote === cardValue) {
      setVote(null);
    } else {
      setVote(cardValue);
    }
  }
  
  const isSelected = currentVote?.cardValue === cardValue;

  return (
    <div
      className={`flex items-center justify-center w-16 h-16 m-2 text-2xl font-bold text-white bg-gray-800 rounded-lg cursor-pointer 
      ${isSelected ? "bg-green-500" : "bg-gray-800 hover:bg-green-500"}`}
      onClick={handleSelect}
    >
      {cardValue ? cardValue : "?"}
    </div>
  );
}

export default Card;
