import { useState } from "react";
import { CardValue } from "../types";
import { useSessionContext } from "../contexts/SessionContext";
type CardProps = {
  cardValue: CardValue;
};

function Card({ cardValue }: CardProps) {
  const { currentVote, setVote, isGameActionDisabled: isDisabled } = useSessionContext();

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
      className={`flex items-center justify-center w-16 h-16 text-2xl font-bold text-white bg-gray-800 rounded-lg cursor-pointer 
      ${isSelected && "bg-green-500"}
      ${isDisabled && "opacity-50 cursor-not-allowed"}
      ${!isDisabled && !isSelected && "hover:bg-green-500"}
      `}
      onClick={handleSelect}
    >
      {cardValue ? cardValue : "?"}
    </div>
  );
}

export default Card;
