import React, { createContext, useContext, useMemo, useState } from "react";
import { User } from "../types";

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  renameUser: (username: string) => void;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  setUser: () => {},
  renameUser: () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  function renameUser(username: string) {
    setUser((user) => {
      if (user) {
        return { ...user, username };
      }
      return null;
    });
  }

  const api = useMemo(() => {
    return {
      user,
      setUser,
      renameUser,
    };
  }, [user]);

  return <UserContext.Provider value={api}>{children}</UserContext.Provider>;
};
