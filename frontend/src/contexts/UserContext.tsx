import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { User } from "../types";
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

interface UserContextProps {
  user: User | null;
  clientId?: string;
  setUser: (user: User | null) => void;
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (username: string, password: string, dataPolicyIsAccepted: boolean) => Promise<void>;
  logoutUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  clientId: "",
  setUser: () => {},
  loginUser: async () => {},
  registerUser: async () => {},
  logoutUser: async () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [clientId] = useState<string>(uuidv4());

  const loginUser = async (username: string, password: string) => {
    try {
      const response = await fetch("/rpc", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "login",
          params: [username, password],
          id: clientId,
        }),
      }).then((res) => res.json());

      if (!response.error) {
        const csrftoken = Cookies.get("csrftoken");

        if (!csrftoken) {
          alert("Login failed");
          return;
        }

        setUser({ username, csrftoken });
        Cookies.set("username", username);
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const registerUser = async (username: string, password: string, dataPolicyIsAccepted: boolean) => {
    if (!dataPolicyIsAccepted) {
      alert("Registration failed");
      return;
    }

    try {
      const response = await fetch("/rpc", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "register",
          params: [username, password],
          id: clientId,
        }),
      }).then((res) => res.json());

      if (!response.error) {
        const csrftoken = Cookies.get("csrftoken");

        if (!csrftoken) {
          alert("Registration failed");
          return;
        }

        setUser({ username, csrftoken });
        Cookies.set("username", username);
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      alert("Registration failed");
    }
  };

  const logoutUser = async () => {
    try {
      const response = await fetch("/rpc", {
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "logout",
          params: [],
          id: clientId,
        }),
      }).then((res) => res.json());

      if (!response.error) {
        setUser(null);
        Cookies.remove("username");
        Cookies.remove("csrftoken");
        Cookies.remove("sessionid");
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      alert("Logout failed");
    }
  };

  useEffect(() => {
    const csrftoken = Cookies.get("csrftoken");
    const username = Cookies.get("username");

    if (csrftoken && username) {
      setUser({ username, csrftoken });
    }
  }, []);

  const api = useMemo(() => {
    return {
      user,
      clientId,
      setUser,
      loginUser,
      registerUser,
      logoutUser,
    };
  }, [user]);

  return <UserContext.Provider value={api}>{children}</UserContext.Provider>;
};
