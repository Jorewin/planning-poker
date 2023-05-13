import {
  useUserContext,
  UserContext,
  UserProvider,
} from "./contexts/UserContext";
import { useSessionContext, SessionContext } from "./contexts/SessionContext";
import Game from "./routes/Game";
import Login from "./routes/Login";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

function Routes() {
  const { user } = useUserContext();

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      {!user && <Login />}
      {user && <Game />}
    </div>
  );
}

export default function App() {
  return (
    <>
      <UserProvider>
        <Routes />
      </UserProvider>
    </>
  );
}
