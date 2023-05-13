import React, { useState } from "react";
import { useUserContext } from "../contexts/UserContext";
import { v4 as uuidv4 } from "uuid";

const Login = () => {
  const [usernameInput, setUsernameInput] = useState("");
  const { setUser } = useUserContext();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUsernameInput(e.target.value);
  }

  function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!usernameInput) return;
    const user = {
      username: usernameInput,
      id: uuidv4(),
    };

    setUser(user);
  }

  const isDisabled = !usernameInput;

  return (
    <div className="flex flex-col justify-center items-center self-center gap-2">
      <label htmlFor="username">Your unique username:</label>
      <input
        className="rounded-lg font-bold text-2xl px-2 py-1 bg-green-100 text-green-500"
        type="text"
        value={usernameInput}
        onChange={handleInputChange}
      />
      <button
        className="border rounded-lg px-2 py-1 bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={isDisabled}
      >
        Rename
      </button>
    </div>
  );
};

export default Login;
