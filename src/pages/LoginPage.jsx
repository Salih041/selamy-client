import { useState, useEffect } from 'react'
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import "../styles/auth.css"
import toast from 'react-hot-toast';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login , isLoggedIn } = useAuth();
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

    try {
      const response = await api.post("/auth/login", {
        username: username,
        password: password
      });
      const { token } = response.data;

      login(token);
      toast.success("Logged in")
      navigate('/');
    } catch (error) {
      setError(error.response ? error.response.data.message : "Login Error");
      toast.error("Login Error")
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <h1 className='auth-title'>LOGIN</h1>

        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor="username">Username</label>
            <input className='form-input' type="text" id='username' value={username} required placeholder='Your username' onChange={(e) => { setUsername(e.target.value) }} />
          </div>

          <div className='form-group'>
            <label htmlFor="password">Password</label>
            <input className='form-input' type="password" id='password' value={password} required placeholder='Your password' onChange={(e) => { setPassword(e.target.value) }} />
          </div>

          {error && <div className='auth-error'>{error}</div>}

          <button className='auth-button' type='submit' disabled={isLoading}>{isLoading ? 'Logging' : "Login"}</button>
        </form>


        <div className='auth-footer'>
          <p style={{ marginTop: '10px',}}>
            <Link to="/forgot-password" style={{ color: '#3498db', fontSize: '0.9rem' }}>Forgot your password?</Link>
          </p>
          Don't have an account? <Link to={"/register"}>Register</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage
