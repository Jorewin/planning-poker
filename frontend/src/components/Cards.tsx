import { useSessionContext } from "../contexts/SessionContext";
import { CardValues, GameStatus } from "../types";
import Card from "./Card";

const Cards = () => {
  const { game } = useSessionContext();
  const { isGameActionDisabled: isDisabled } = useSessionContext();

  return (
    <div
      className={`w-4/6 flex justify-center ${
        isDisabled && "opacity-50 cursor-not-allowed"
      }`}
    >
      {CardValues.map((cardValue) => (
        <Card key={cardValue} cardValue={cardValue} />
      ))}
    </div>
  );
};

export default Cards;
