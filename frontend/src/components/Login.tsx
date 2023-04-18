import React, { useState } from 'react';

type Props = {
  handleJoin: (developerID: string) => void;
};

const Login = ({ handleJoin }: Props) => {
  const [developerID, setDeveloperID] = useState('');

  const handleInputChange = (event) => {
    setDeveloperID(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleJoin(developerID);
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <label htmlFor="developerID">Enter Your Unique ID:</label>
        <input type="text" id="developerID" value={developerID} onChange={handleInputChange} className='border' />
        <button type="submit">Join Session</button>
      </form>
    </div>
  );
};

export default Login;
