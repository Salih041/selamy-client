import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from "../api"
import "../styles/auth.css"
import toast from 'react-hot-toast';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await api.post("/auth/register", {
        username: username,
        password: password
      });
      toast.success("Registered")
      navigate('/login');
    } catch (error) {
      console.error("Register error:", error);
      setError(error.response ? error.response.data.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <h1 className='auth-title'>REGISTER</h1>

        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor="username">Username</label>
            <input className='form-input' type="text" id='username' value={username} required placeholder='username' onChange={(e) => { setUsername(e.target.value) }} />
          </div>

          <div className='form-group'>
            <label htmlFor="password">Password</label>
            <input className='form-input' type="password" id='password' value={password} required placeholder='password' onChange={(e) => { setPassword(e.target.value) }} />
          </div>

          {error && <div className='auth-error'>{error}</div>}

          <button className='auth-button' type='submit' disabled={isLoading}>{isLoading ? 'Registering' : "Register"}</button>
        </form>

        <div className='auth-footer'>
          Already have an account? <Link to={"/login"}>Login</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
