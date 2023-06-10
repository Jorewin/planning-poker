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

export enum GameStatus {
  NOT_READY = "NOT_READY",
  READY = "READY",
  VOTING = "VOTING",
}

export enum GameStatusMessage {
  NOT_READY = "Start a game or join one",
  READY = "Ready to start",
  VOTING = "Voting in progress",
}

export type Game = {
  id: string;
  name: string;
  users: User[];
  code: string;
  roundResults: GameRoundResult[];
};
