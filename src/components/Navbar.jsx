import React from 'react'
import {NavLink,useNavigate} from "react-router-dom" 
import {useAuth} from "../context/AuthContext"

import '../styles/Navbar.css';

function Navbar() {

  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = ()=>{
    logout();
    navigate("/");
  }

  return (
    <nav className='nav'>
        <div className='nav__logo'>
            <NavLink to="/">Selam Ya</NavLink>
        </div>

        <div className='nav__links'>
          {isLoggedIn ? (
            <>
            <NavLink to="/create-post">Create Post</NavLink>
            <button className='navbar-logout-button' onClick={handleLogout}>Logout</button>
            </>
          ):(
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </div>
    </nav>
  )
}

export default Navbar
