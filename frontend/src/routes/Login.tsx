import React, { useState } from "react";
import { useUserContext } from "../contexts/UserContext";
import { v4 as uuidv4 } from "uuid";

const Login = () => {
  const [usernameInput, setUsernameInput] = useState("");
  const { setUser } = useUserContext();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUsernameInput(e.target.value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!usernameInput) return;
    const user = {
      username: usernameInput,
      id: uuidv4(),
    };

    setUser(user);
  }

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col justify-center items-center self-center gap-2">
          <label htmlFor="username">Your unique username:</label>
          <input
            type="text"
            id="username"
            value={usernameInput}
            onChange={handleInputChange}
            className="border px-2 py-1 rounded-md"
          />
          <button
            type="submit"
            className="border px-2 py-1 bg-amber-500 text-white rounded-md disabled:cursor-not-allowed"
            disabled={!usernameInput}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
