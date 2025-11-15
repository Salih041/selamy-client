import React, { useState } from 'react'
import {useAuth} from "../context/AuthContext"
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';

function LoginPage() {
  const [username,setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading,setIsLoading] = useState(false);
  const [error,setError] = useState(null);

  const {login} = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try{
      const response = await api.post("/auth/login",{
        username:username,
        password:password
      });
      const token = response.data.token;

      login(token);

      navigate('/');
    }catch(error)
    {
      console.error("Login error " ,error)
      setError(error.response ? error.response.data.message : "Login Error");
    }finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1>Login</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage
