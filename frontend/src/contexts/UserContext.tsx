import React, { createContext, useContext, useMemo, useState } from "react";
import { User } from "../types";

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  renameUser: (username: string) => void;
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (username: string, password: string) => Promise<void>;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  setUser: () => {},
  renameUser: () => {},
  loginUser: async () => {},
  registerUser: async () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
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

  const loginUser = async (username: string, password: string) => {
    try {
      const response = await fetch("/rpc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "login",
          params: [username, password],
        }),
      }).then((res) => res.json());

      if (!response.error) {
        setUser({ username });
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.log(error);
      
    }
  };

  const registerUser = async (username: string, password: string) => {
    try {
      const response = await fetch("/rpc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "register",
          params: [username, password],
        }),
      }).then((res) => res.json());

      if (!response.error) {
        setUser({ username });
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      alert("Registration failed");
    }
  };

  const api = useMemo(() => {
    return {
      user,
      setUser,
      renameUser,
      loginUser,
      registerUser,
    };
  }, [user]);

  return <UserContext.Provider value={api}>{children}</UserContext.Provider>;
};
