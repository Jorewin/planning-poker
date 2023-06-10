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

export type GameRound = {
  votes: Vote[];
  result: GameRoundResult | null;
};

export type GameRoundResult = {
  average: number;
  consensus: number;
};

export enum GameStatus {
  NOT_READY = "NOT_READY",
  READY = "READY",
  ROUND_IN_PROGRESS = "ROUND_IN_PROGRESS",
  ROUND_READY = "ROUND_READY",
  ROUND_FINISHED = "ROUND_FINISHED",
}

export enum GameStatusMessage {
  NOT_READY = "Start a game or join one",
  READY = "Ready to start",
  ROUND_IN_PROGRESS = "Round in progress",
  ROUND_READY = "Ready to vote",
  ROUND_FINISHED = "Round finished",
}

export type Game = {
  id: string;
  name: string;
  users: User[];
  rounds: GameRound[];
  status: GameStatus;
  currentRound: GameRound | null;
  code: string;
  roundResults: GameRoundResult[];
};
