import React, { useState } from 'react'
import {NavLink,useNavigate} from "react-router-dom" 
import {useAuth} from "../context/AuthContext"

import '../styles/navbar.css';

function Navbar() {

  const { isLoggedIn, logout, userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleLogout = ()=>{
    logout();
    navigate("/");
  }

  const handleSearch = (e)=>{
    e.preventDefault();
    if(!searchQuery.trim()) return;

    navigate(`/?search=${searchQuery}`);
    setSearchQuery("");
  }

  return (
    <nav className='nav'>
        <div className='nav__logo'>
            <NavLink to="/">Selam Ya</NavLink>
        </div>

        <form onSubmit={handleSearch} className='search-form'>
          <input className='nav_search-input' type="text" placeholder='Search' value={searchQuery} onChange={(e)=>{setSearchQuery(e.target.value)}} />
        </form>

        <div className='nav__links'>
          {isLoggedIn ? (
            <>
            <NavLink to={`/profile/${userId}`} className="nav-profile-link">My Profile</NavLink>
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
