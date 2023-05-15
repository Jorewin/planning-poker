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
    if (username.length < 3)
      return alert("Username must be at least 3 characters long.");
    else if (username.length > 15)
      return alert("Username must be at most 15 characters long.");
    
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
