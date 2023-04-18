import React from "react";

interface Props {
  handleVote: (cardValue: number) => void;
}

const Cards = ({ handleVote }: Props) => {
  const cardValues = [0, 1, 2, 3, 5, 8, 13, 20, 40, 100];

  return (
    <div className="bg-gray-100 p-4 flex justify-center space-x-4">
      {cardValues.map((cardValue) => (
        <button
          key={cardValue}
          onClick={() => handleVote(cardValue)}
          className="border-gray-400 border p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          {cardValue}
        </button>
      ))}
    </div>
  );
};

export default Cards;
