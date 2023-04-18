import React, { useState } from "react";

interface Props {
  handleVote: (cardValue: number) => void;
}

const Cards = ({ handleVote }: Props) => {
  const cardValues = [0, 1, 2, 3, 5, 8, 13, 20, 40, 100];
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  function handleCardClick(cardValue: number) {
    setSelectedCard(cardValue);
    handleVote(cardValue);
  }

  return (
    <>
      {selectedCard && (
        <div className="bg-blue-500 text-white px-4 py-2">
          You selected: {selectedCard}
          <br />
          You can change your vote by clicking on another card before the timer
          runs out.
        </div>
      )}
      <div className="bg-gray-100 p-4 flex justify-center space-x-4">
        {cardValues.map((cardValue) => (
          <button
            key={cardValue}
            onClick={() => handleCardClick(cardValue)}
            className={`${
              selectedCard === cardValue
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50`}
          >
            {cardValue}
          </button>
        ))}
      </div>
    </>
  );
};

export default Cards;
