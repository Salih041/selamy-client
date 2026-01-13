import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import '../styles/Posting.css';

function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            toast.success("Code Sent!");
            navigate("/reset-password", { state: { email: email } });
        } catch (error) {
            const msg = error.response?.data?.message || "Error";
            toast.error(msg);
        }
        finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='post-form-container' style={{ maxWidth: '400px' }}>
            <div className='post-form-card'>
                <h1 className='post-form-title'>I Forgot My Password</h1>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                    Enter your account email address and we'll send you a reset code.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label>Email</label>
                        <input
                            type="email"
                            className='form-input'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='example@email.com'
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={isLoading} style={{ width: '100%' }}>
                        {isLoading ? '...' : 'Send Code'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ForgotPasswordPage
