import React from 'react';

type Props = {
  votes: { developerID: string; value: number }[];
  isConsensusReached: boolean;
  consensusValue: number;
};

const Results = ({ votes, isConsensusReached, consensusValue } : Props) => {
  return (
    <div className="bg-gray-100 p-4">
      <h2 className="text-gray-700 font-bold text-lg mb-4">Results</h2>
      <ul>
        {votes.map((vote) => (
          <li key={vote.developerID} className="flex justify-between mb-2">
            <span>{vote.developerID}:</span>
            <span>{vote.value}</span>
          </li>
        ))}
      </ul>
      {isConsensusReached && (
        <p className="text-gray-700 font-medium mt-4">Consensus Reached: {consensusValue}</p>
      )}
    </div>
  );
};

export default Results;
