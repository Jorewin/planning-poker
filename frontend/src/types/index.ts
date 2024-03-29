export type CardValue = 1 | 2 | 3 | 5 | 8 | 13 | 21 | 34 | 55 | 89 | 144;
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
  144
];

export type User = {
  username: string;
  csrftoken: string;
};

export type Vote = {
  username: string;
  cardValue: CardValue;
};

export type GameRoundResult = {
  average: number;
  consensus: number;
};

export type Game = {
  id: string;
  isOwner: boolean;
};

export type Player = {
  id: string;
  username: string;
  hasVoted: boolean;
  selection?: CardValue;
};

export type Story = {
  id: string;
  summary: string;
  description: string;
  tasks: Task[];
};

export type Task = {
  id: string;
  summary: string;
  estimation: CardValue;
};