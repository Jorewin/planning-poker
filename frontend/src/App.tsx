import { SessionProvider } from "./contexts/SessionContext";
import {
  useUserContext,
  UserContext,
  UserProvider,
} from "./contexts/UserContext";
import Game from "./routes/Game";
import Login from "./routes/Login";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

function Routes() {
  const { user } = useUserContext();

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
        <SessionProvider>
          <Routes />
        </SessionProvider>
      </UserProvider>
    </>
  );
}
