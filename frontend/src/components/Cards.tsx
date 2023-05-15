import { useSessionContext } from "../contexts/SessionContext";
import { CardValues, GameStatus } from "../types";
import Card from "./Card";

const Cards = () => {
  const { game } = useSessionContext();
  const { isGameActionDisabled: isDisabled } = useSessionContext();

  return (
    <div
      className={`flex justify-center gap-2`}
    >
      {CardValues.map((cardValue) => (
        <Card key={cardValue} cardValue={cardValue} />
      ))}
    </div>
  );
};

export default Cards;
