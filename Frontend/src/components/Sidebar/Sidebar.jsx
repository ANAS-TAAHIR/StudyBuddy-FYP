import React, { useState } from 'react';
import HomeIcon from '../../assets/icons/Home.svg';
import BagIcon from '../../assets/icons/Bag.svg';
import CategoryIcon from '../../assets/icons/Category.svg';
import ChatIcon from '../../assets/icons/Chat.svg';
import DocIcon from '../../assets/icons/Document.svg';
import ConvIcon from '../../assets/icons/Conv.png';
import openArrow from '../../assets/icons/rightarrow.svg';
import closeArrow from '../../assets/icons/leftarrow.png';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative h-screen flex">
      {/* Sidebar */}
      <div className={`bg-[#FFCBA4] text-black flex flex-col justify-between transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'} overflow-hidden relative`}>
        <div className="p-4">
          {/* Navigation Items */}
          <ul>
            <Link to="/dashboard">
            <li className="mb-4 flex items-center text-black hover:bg-[#F24E1E] p-2 rounded transition-colors cursor-pointer">
              <img src={HomeIcon} alt="Dashboard" className="mr-4" />
              {isOpen && <span>Dashboard</span>}
            </li>
            </Link>
            <Link to="/chatbot">
            <li className="mb-4 flex items-center text-black hover:bg-[#F24E1E] p-2 rounded transition-colors cursor-pointer">
              <img src={ConvIcon} alt="Chat" className="mr-4 w-9" />
              {isOpen && <span>Chat</span>}
            </li>
            </Link>
            <Link to="/resources">
            <li className="mb-4 flex items-center text-black hover:bg-[#F24E1E] p-2 rounded transition-colors cursor-pointer">
              <img src={DocIcon} alt="Resources" className="mr-4" />
              {isOpen && <span>Resources</span>}
            </li>
            </Link>
            <Link to="/todo">
            <li className="mb-4 flex items-center text-black hover:bg-[#F24E1E] p-2 rounded transition-colors cursor-pointer">
              <img src={ChatIcon} alt="To Do" className="mr-4" />
              {isOpen && <span>To Do</span>}
            </li>
            </Link>
            <Link to="/extension">
            <li className="mb-4 flex items-center text-black hover:bg-[#F24E1E] p-2 rounded transition-colors cursor-pointer">
              <img src={CategoryIcon} alt="Extension" className="mr-4" />
              {isOpen && <span>Extension</span>}
            </li>
            </Link>
            <Link to="/books">
            <li className="mb-4 flex items-center text-black hover:bg-[#F24E1E] p-2 rounded transition-colors cursor-pointer">
              <img src={BagIcon} alt="Books" className="mr-4" />
              {isOpen && <span>Books</span>}
            </li>
            </Link>
            <Link to='/extras'>
            <li className="mb-4 flex items-center text-black hover:bg-[#F24E1E] p-2 rounded transition-colors cursor-pointer">
              <img src={BagIcon} alt="Extras" className="mr-4" />
              {isOpen && <span>Extras</span>}
            </li>            
            </Link>
          </ul>
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 transform -translate-y-1/2 bg-[#FFCBA4] p-2 rounded-full focus:outline-none hover:bg-[#F24E1E] cursor-pointer"
        style={{
          marginLeft: isOpen ? '-18px' : '0',
          right: isOpen ? '-12px' : '-40px',
          transition: 'right 0.3s ease'
        }}
      >
        <img
          src={isOpen ? closeArrow : openArrow}
          alt={isOpen ? "Close Sidebar" : "Open Sidebar"}
          className="w-6 h-6"
        />
      </button>
    </div>
  );
};

export default Sidebar;
