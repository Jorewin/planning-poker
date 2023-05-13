import { useState } from "react";
import { CardValue, Vote } from "../types";

type CardProps = {
  cardValue: CardValue;
};

function Card({ cardValue }: CardProps) {
  const [isSelected, setIsSelected] = useState(false);

  function handleSelect() {
    setIsSelected((isSelected) => !isSelected);
  }

  return (
    <div
      className={`flex items-center justify-center w-16 h-16 m-2 text-2xl font-bold text-white bg-gray-800 rounded-lg cursor-pointer 
      ${isSelected ? "bg-green-500" : "bg-gray-800 hover:bg-green-500"}`}
      onClick={handleSelect}
    >
      {cardValue}
    </div>
  );
}

export default Card;
