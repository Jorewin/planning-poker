export type CardValue = 1 | 2 | 3 | 5 | 8 | 13 | 21 | 34 | 55 | 89 | 144 | null | "?";
export const CardValues: CardValue[] = [
  1,
  2,
  3,
  5,
  8,
  13,
  21,
  34,
  55,
  89,
  144,
  "?"
];

export type User = {
  id: string;
  username: string;
};

export type Vote = {
  userId: string;
  cardValue: CardValue;
};

export type GameRoundResult = {
  average: number;
  consensus: number;
};

export type Game = {
  id: string;
  name: string;
  users: User[];
  code: string;
};

export type Player = {
  id: string;
  username: string;
  hasVoted: boolean;
  cardValue?: CardValue;
};