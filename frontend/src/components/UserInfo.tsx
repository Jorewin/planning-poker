import { useContext, useState } from "react";
import { UserContext } from "../contexts/UserContext";

const UserInfo = () => {
  const { user, logoutUser } = useContext(UserContext);

  return (
    <div className="flex flex-col gap-4 items-center border-4 rounded-lg p-4 bg-white h-fit">
      <p className="text-center font-bold">{user?.username}</p>
      <button
        className="border rounded-lg px-2 py-1 bg-red-500 text-white"
        onClick={logoutUser}
      >
        Logout
      </button>
    </div>
  );
};

export default UserInfo;
