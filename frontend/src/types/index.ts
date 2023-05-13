export type CardValue = 1 | 2 | 3 | 5 | 8 | 13 | 21 | 34 | 55 | 89 | 144;
export const CardValues: CardValue[] = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

export type User = {
  id: string;
  username: string;
};

export type Vote = {
  userId: string;
  cardValue: CardValue;
};

export type GameRound = {
  id: string;
  votes: Vote[];
  result: GameRoundResult | null;
};

export type GameRoundResult = {
  average: number;
  consensus: boolean;
};

enum GameStatus {
  CREATED = "CREATED",
  READY = "READY",
  ROUND_IN_PROGRESS = "ROUND_IN_PROGRESS",
  ROUND_READY = "ROUND_READY",
  ROUND_FINISHED = "ROUND_FINISHED",
}

export type Game = {
  id: string;
  name: string;
  users: User[];
  rounds: GameRound[];
  status: GameStatus;
  currentRound: GameRound;
};
