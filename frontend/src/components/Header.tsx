import React from 'react';

const Header = () => {
  return (
    <div className="bg-blue-500 p-4 flex justify-between items-center">
      <h1 className="text-white font-bold text-2xl">Planning Poker</h1>
      <nav>
        <ul className="flex space-x-4">
          <li><a href="#" className="text-white hover:text-gray-300">Home</a></li>
          <li><a href="#" className="text-white hover:text-gray-300">About</a></li>
          <li><a href="#" className="text-white hover:text-gray-300">Contact</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;