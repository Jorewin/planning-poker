import React from "react";
import { User } from "../types";

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = React.createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export function useUser() {
  const [user, setUser] = React.useState<User | null>(null);

  return {
    user,
    setUser,
  };
}
