import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User } from "../types";
import { v4 as uuidv4 } from "uuid";
interface UserContextProps {
  user: User | null;
  clientId: string;
  setUser: (user: User | null) => void;
  renameUser: (username: string) => void;
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (username: string, password: string) => Promise<void>;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  clientId: "",
  setUser: () => {},
  renameUser: () => {},
  loginUser: async () => {},
  registerUser: async () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [clientId, setClientId] = useState<string>("");

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
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "login",
          params: [username, password],
          id: 1,
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
      clientId,
      setUser,
      renameUser,
      loginUser,
      registerUser,
    };
  }, [user]);

  useEffect(() => {
    setClientId(uuidv4());
  }, []);
    

  return <UserContext.Provider value={api}>{children}</UserContext.Provider>;
};
