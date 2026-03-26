import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { Menu, X, Home, Pen, User, Calendar, LogOut } from 'lucide-react';
import './Sidebar.css';
import { myUserContext } from '../context/MyContextProvider';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutUser } = useContext(myUserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navi = (route) => {
    setIsOpen(false);
    navigate(route);
  };

  
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <span className="logo">Events4Everyone</span>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-top">
           
            <a onClick={() => navi("/")} className={isActive("/") ? "active" : ""}>
              <Home size={20}/> <span>Kezdőlap</span>
            </a>
            
            {user ? (
              <a onClick={() => navi("/profile")} className={isActive("/profile") ? "active" : ""}>
                <User size={20}/> <span>Profil</span>
              </a>
            ) : (
              <a onClick={() => navi("/signin")} className={isActive("/signin") ? "active" : ""}>
                <User size={20}/> <span>Bejelentkezés</span>
              </a>
            )}
            
            <a onClick={() => navi("/create_event")} className={isActive("/create_event") ? "active" : ""}>
              <Pen size={20}/> <span>Esemény létrehozása</span>
            </a>
            
            <a onClick={() => navi("/events")} className={isActive("/events") ? "active" : ""}>
              <Calendar size={20}/> <span>Események</span>
            </a>
          </div>

          {user && (
            <div className="nav-bottom">
              <a onClick={() => logoutUser()} className='sidebarLogout'>
                <LogOut size={20}/> <span>Kijelentkezés</span>
              </a>
            </div>
          )}
        </nav>
      </div>

      {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;