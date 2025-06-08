// src/Header.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import { AuthContext } from "./../AuthContext";
import './styles/Header.css';

function Header() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('https://recipefinder-af8u.onrender.com/login');
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <h1 className="logo"> 
            <LocalDiningIcon className="logo-icon"/> AskChef
          </h1>
        </Link>
        
        <div className="linkComponents">
          <Link to="/" className="nav-link">
            <h5 className="tab">Home</h5>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/create" className="nav-link">
                <h5 className="tab">Add+</h5>
              </Link>
              <Link to="/manage-recipes">My Recipes</Link>
              
              <div className="user-info">
                <span className="welcome">Welcome, {user?.username}</span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <h5 className="tab">Login</h5>
              </Link>
              <Link to="/register" className="nav-link">
                <h5 className="tab">Register</h5>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
