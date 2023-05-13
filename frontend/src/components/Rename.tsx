import { useContext, useState } from "react";
import { UserContext } from "../contexts/UserContext";

const Rename = () => {
  const { user, setUser, renameUser } = useContext(UserContext);
  const [usernameInput, setUsernameInput] = useState(user!.username);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUsernameInput(e.target.value);
  }

  function handleSubmit() {
    renameUser(usernameInput);
  }

  const isDisabled = usernameInput === user!.username || !usernameInput;

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-4 justify-center items-center border-4 rounded-lg p-4 bg-white">
      <input
        className="rounded-lg font-bold text-2xl px-2 py-1 bg-amber-100 text-amber-500"
        type="text"
        value={usernameInput}
        onChange={handleInputChange}
      />
      <button
        className="border rounded-lg px-2 py-1 bg-amber-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={isDisabled}
      >
        Rename
      </button>
    </div>
  );
};

export default Rename;
