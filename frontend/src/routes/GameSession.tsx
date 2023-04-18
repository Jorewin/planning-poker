import React, { useState } from 'react';
import Header from '../components/Header';
import Login from '../components/Login';
import Cards from '../components/Cards';
import Timer from '../components/Timer';
import Results from '../components/Results';

const Session = () => {
  const [developerID, setDeveloperID] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [votes, setVotes] = useState([]);
  const [isVotingStarted, setIsVotingStarted] = useState(false);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isConsensusReached, setIsConsensusReached] = useState(false);
  const [consensusValue, setConsensusValue] = useState('');

  const handleJoin = (developerID) => {
    setDeveloperID(developerID);
    setIsJoined(true);
  };

  const handleVote = (value) => {
    setVotes((prevVotes) => [...prevVotes, { developerID, value }]);
  };

  const handleStartVoting = () => {
    setIsVotingStarted(true);
  };

  const handleStartTimer = () => {
    setIsTimerStarted(true);
  };

  const handleTimeout = () => {
    setIsTimerStarted(false);
    setIsConsensusReached(true);
    const votesCount = votes.reduce((acc, vote) => {
      if (vote.value in acc) {
        acc[vote.value] += 1;
      } else {
        acc[vote.value] = 1;
      }
      return acc;
    }, {});
    const consensusValue = Object.keys(votesCount).reduce((a, b) => votesCount[a] > votesCount[b] ? a : b);
    setConsensusValue(consensusValue);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {!isJoined && <Login handleJoin={handleJoin} />}
      {isJoined && !isVotingStarted && (
        <div className="bg-gray-100 p-4 flex justify-center">
          <button onClick={handleStartVoting} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50">Start Voting</button>
        </div>
      )}
      {isVotingStarted && !isTimerStarted && (
        <div className="bg-gray-100 p-4 flex justify-center">
          <button onClick={handleStartTimer} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50">Start Timer</button>
        </div>
      )}
      {isVotingStarted && isTimerStarted && (
        <Timer timeRemaining={timeRemaining} setTimeRemaining={setTimeRemaining} handleTimeout={handleTimeout} />
      )}
      {isVotingStarted && !isTimerStarted && (
        <>
          <Cards handleVote={handleVote} />
          <Results votes={votes} isConsensusReached={isConsensusReached} consensusValue={consensusValue} />
        </>
      )}
    </div>
  );
};

export default Session;