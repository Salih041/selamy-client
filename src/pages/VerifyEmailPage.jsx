import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import '../styles/Posting.css';

function VerifyEmailPage() {

    const [code, setCode] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;
    if (!email) {
        navigate("/register");
        return null;
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            await api.post("/auth/verify-email", { email, code });
            toast.success("Account verified!");
            navigate("/login");
        }
        catch (error) {
            const msg = error.response?.data?.message || "Verification failed";
            toast.error(msg);
        }
    }

    return (
        <div className='post-form-container' style={{ maxWidth: '400px' }}>
            <div className='post-form-card'>
                <h1 className='post-form-title'>Enter Code</h1>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                    We sent a 6-digit code to address <b>{email}</b> 
                </p>

                <form onSubmit={handleVerify}>
                    <div className='form-group'>
                        <label>Verification Code</label>
                        <input
                            type="text"
                            className='form-input'
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder='531431'
                            maxLength={6}
                            required
                            style={{ letterSpacing: '5px', fontSize: '1.2rem', textAlign: 'center' }}
                        />
                    </div>
                    <button type="submit" className="submit-btn" style={{ width: '100%' }}>
                        Verify
                    </button>
                </form>
            </div>
        </div>
    )
}

export default VerifyEmailPage
