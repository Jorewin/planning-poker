import { useContext, useState } from "react";
import { UserContext } from "../contexts/UserContext";

const Rename = () => {
  const { user, logoutUser, renameUser } = useContext(UserContext);
  const [usernameInput, setUsernameInput] = useState(user!.username);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUsernameInput(e.target.value);
  }

  function handleSubmit() {
    renameUser(usernameInput);
  }

  const isDisabled = usernameInput === user!.username || !usernameInput;

  return (
    <div className="flex flex-col gap-4 items-center border-4 rounded-lg p-4 bg-white h-fit">
      <input
        className="w-full rounded-lg font-bold px-2 py-1 bg-green-100 text-green-500"
        type="text"
        value={usernameInput}
        onChange={handleInputChange}
      />
      <button className="border rounded-lg px-2 py-1 bg-red-500 text-white" onClick={logoutUser}>
        Logout
      </button>
    </div>
  );
};

export default Rename;
