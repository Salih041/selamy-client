import React, { useState , useEffect} from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from "../api"
import "../styles/auth.css"
import toast from 'react-hot-toast';

function RegisterPage() {

  const MAINTENANCE_MODE = false;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const { isLoggedIn } = useAuth();

  const navigate = useNavigate();

  useEffect(()=>{
      if(isLoggedIn)
      {
        navigate('/');
      }
    },[isLoggedIn])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      setIsLoading(false);
      return;
    }
    try {
      await api.post("/auth/register", {
        username: username,
        email: email,
        password: password
      });
      toast.success("Code sent! Please check your email.")
      navigate("/verify-email", { state: { email: email } });

    } catch (error) {
      console.error("Register error:", error);
      setError(error.response ? error.response.data.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }

  if (MAINTENANCE_MODE) {
    return (
      <div className='post-form-container' style={{ maxWidth: '400px', textAlign: 'center', marginTop: '50px' }}>
        <div className='post-form-card'>
          <h1 className='post-form-title' style={{ color: '#e74c3c', borderBottom: 'none', marginBottom: '10px' }}>
            ⚠️ Registrations Temporarily Closed
          </h1>

          <div style={{ fontSize: '3rem', margin: '10px 0' }}>🚧</div>

          <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '20px' }}>
            New member registration has been temporarily suspended due to work.
          </p>
          <div className='auth-footer'>
            Already have an account? <Link to={"/login"}>Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <h1 className='auth-title'>REGISTER</h1>

        <form onSubmit={handleSubmit}>

          <div className='form-group'>
            <label htmlFor="email">E-mail</label>
            <input className='form-input' type="email" id='email' value={email} required placeholder='E-mail' onChange={(e) => { setEmail(e.target.value) }} />
          </div>

          <div className='form-group'>
            <label htmlFor="username">Username</label>
            <input className='form-input' type="text" id='username' value={username} minLength={3} maxLength={20} required placeholder='Username' onChange={(e) => { setUsername(e.target.value) }} />
          </div>
          <p style={{ fontSize: '0.77rem', color: '#666' }}>
              * Usernames are case-insensitive and will be stored in lowercase.
            </p>

          <div className='form-group'>
            <label htmlFor="password">Password</label>
            <input className='form-input' type="password" id='password' value={password} minLength={6} required placeholder='Password' onChange={(e) => { setPassword(e.target.value) }} />
            <div className='form-group'>
              <label>Confirm Password</label>
              <input type="password" className='form-input' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder='Repeat password' required
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
              * Password must contain at least 6 characters, 1 Uppercase Letter, 1 Lowercase Letter and 1 Number!
            </p>
          </div>

          {error && <div className='auth-error'>{error}</div>}

          <button className='auth-button' type='submit' disabled={isLoading}>{isLoading ? 'Registering' : "Register"}</button>
        </form>

        <div style={{
          marginTop: '25px',
          borderTop: '1px solid #eee',
          paddingTop: '15px',
          fontSize: '0.8rem',
          color: '#666',
          lineHeight: '1.5'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#444' }}>
            By registering, you acknowledge that:
          </p>
          <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '5px' }}>
              <strong>Content Responsibility:</strong> You are entirely responsible for the posts and comments you share.
            </li>
            <li style={{ marginBottom: '5px' }}>
              <strong>Project Status:</strong> SelamY is an evolving educational project. While core features are stable, data persistence and availability cannot be fully guaranteed.
            </li>
            <li>
              <strong>Privacy:</strong> Your email and data will strictly remain within this application.
            </li>
          </ul>
        </div>

        <div className='auth-footer'>
          Already have an account? <Link to={"/login"}>Login</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
