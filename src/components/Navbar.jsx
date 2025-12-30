import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import toast from 'react-hot-toast';
import api from '../api';
import '../styles/navbar.css';
import { IoMdNotifications } from "react-icons/io";
import { useTheme } from '../context/ThemeContext';
import { formatRelativeTime } from '../utils/dateFormater';
import { BsFillSunFill } from "react-icons/bs";
import { IoMoonSharp } from "react-icons/io5";
import { MdAdminPanelSettings } from "react-icons/md";


function Navbar() {

  const { isLoggedIn, logout, userId, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const { theme, toggleTheme } = useTheme();

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

  const fetchNotifications = async () => {
    if (!isLoggedIn) {
      return;
    }
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
      const count = res.data.filter(n => !n.isRead).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("Notification error", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 100000); //100s
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleNotificationClick = async (notif) => {
    setShowNotifications(false);
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif._id}/read`);
        fetchNotifications();
      } catch (error) { console.error(error); }
    }

    if (notif.type === 'follow') {
      navigate(`/profile/${notif.sender._id}`);
    } else {
      if (notif.post?._id) {
        navigate(`/posts/${notif.post._id}`);
      } else {
        toast.error("This content is no longer available.");
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      fetchNotifications();
    } catch (error) { console.error(error); }
  };

  const getNotificationText = (notif) => {
    switch (notif.type) {
      case 'mention':
        return "mentioned you in a comment";
      case 'like':
        return "liked one of your content";
      case 'comment':
        return "commented on the post.";
      case 'follow':
        return "started following you";
      case 'delete':
        if (notif.message === "") return "Your content was deleted for violating our community rules.";
        else return `Your content was deleted! Reason: ${notif.message.toString()}`;
      case 'unpublish':
        if (notif.message === "") return "Your post has been moved to drafts for violating our community rules. You can edit and republish it"
        else return `Your post has been moved to drafts! Reason: ${notif.message.toString()}`;
      default:
        return "interacted with you.";
    }
  };

  return (
    <nav className='nav'>
      <div className='nav__logo'>
        <NavLink to="/">SelamY</NavLink>
      </div>

      <form onSubmit={handleSearch} className='search-form'>
        <input className='nav_search-input' type="text" placeholder='Search' value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }} />
      </form>

      <div className='nav__links'>

        {isAdmin && (<NavLink to="/admin-reports"><MdAdminPanelSettings className='AdminPanelButton' /></NavLink>)}

        {isLoggedIn ? (
          <>
            <div className="nav-notification-wrapper">
              <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <IoMdNotifications />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <button className="mark-all-btn" onClick={handleMarkAllRead}>Mark All Read</button>
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map(notif => (
                        <div
                          key={notif._id}
                          className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="notification-avatar-container">
                            {notif.sender?.profilePicture ? (
                              <img
                                src={notif.sender.profilePicture}
                                alt="avatar"
                                className="notification-avatar-img"
                              />
                            ) : (
                              <span className="notification-avatar-text">
                                {notif.sender?.username?.charAt(0).toUpperCase() || "?"}
                              </span>
                            )}
                          </div>
                          <div className="notification-content">
                            <p className="notification-text">
                              <strong>{notif.sender?.username || "user"} </strong>
                              {getNotificationText(notif)}
                            </p>
                            <span className="notification-time">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="notification-empty">No notification</div>
                  )}
                </div>
              )}
            </div>
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
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Temayı Değiştir">
          {theme === 'light' ? <IoMoonSharp /> : <BsFillSunFill />}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
