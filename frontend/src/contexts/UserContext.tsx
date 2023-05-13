import React, { createContext, useContext, useMemo, useState } from "react";
import { User } from "../types";

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  setUser: () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const api = useMemo(() => {
    return {
      user,
      setUser,
    };
  }, [user]);

  return <UserContext.Provider value={api}>{children}</UserContext.Provider>;
};
