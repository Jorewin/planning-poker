import React, { useState } from "react";
import { useUserContext } from "../contexts/UserContext";

const AuthForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dataPolicyIsAccepted, setDataPolicyIsAccepted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { loginUser, registerUser } = useUserContext();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLogin) {
      await loginUser(username, password);
    } else {
      await registerUser(username, password, dataPolicyIsAccepted);
    }
  };

  const switchForm = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setPassword("");
  };

  return (
    <div className="flex flex-col justify-center items-center self-center gap-4">
      <h2 className="text-2xl font-semibold">
        {isLogin ? "Login" : "Register"}
      </h2>
      <form onSubmit={handleAuth} className="flex w-64 flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 w-64 bg-white rounded shadow-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 w-64 bg-white rounded shadow-md"
        />
        {
          isLogin
            ? null
            : <div className="flex gap-4 items-center">
                <input
                  id="checkbox-data-policy"
                  onChange={() => setDataPolicyIsAccepted(!dataPolicyIsAccepted)}
                  type="checkbox"
                  checked={dataPolicyIsAccepted}
                />
                <label htmlFor="checkbox-data-policy">I agree to this app's privacy policy, which can't currently be found anywhere.</label>
              </div>
        }
        <button
          type="submit"
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded shadow-md hover:bg-green-600"
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <button onClick={switchForm} className="text-blue-500 hover:underline">
        {isLogin ? "New user? Register" : "Already registered? Login"}
      </button>
    </div>
  );
};

export default AuthForm;