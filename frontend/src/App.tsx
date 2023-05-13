import { useUserContext, UserContext, UserProvider } from "./contexts/UserContext";
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
    <>
      {!user && <Login />}
      {user && <Game />}
    </>
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
