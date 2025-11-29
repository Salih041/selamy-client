import React, { useState , useEffect} from 'react'
import { NavLink, useNavigate} from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import toast from 'react-hot-toast';
import api from '../api';
import '../styles/navbar.css';

function Navbar() {

  const { isLoggedIn, logout, userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn && userId) {
        try {
          const res = await api.get(`/users/${userId}`);
          setCurrentUser(res.data);
        } catch (error) {
          console.error("Navbar user fetch error", error);
        }
      }
    };
    fetchUserData();
  }, [isLoggedIn, userId]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out")
    navigate("/");
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    navigate(`/?search=${searchQuery}`);
    setSearchQuery("");
  }

  return (
    <nav className='nav'>
      <div className='nav__logo'>
        <NavLink to="/">SelamY</NavLink>
      </div>

      <form onSubmit={handleSearch} className='search-form'>
        <input className='nav_search-input' type="text" placeholder='Search' value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }} />
      </form>

      <div className='nav__links'>
        {isLoggedIn ? (
          <>
            <NavLink to={`/profile/${userId}`} className="nav-profile-link" title="Profilim">
              <div className="nav-avatar-container">
                {currentUser?.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt="Profile"
                    className="nav-avatar-img"
                  />
                ) : (
                  <span>
                    {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </NavLink>
            <button className='navbar-logout-button' onClick={handleLogout}>Logout</button>
          </>
        ) : (
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
