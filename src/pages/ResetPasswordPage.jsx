import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import '../styles/Posting.css';

function ResetPasswordPage() {
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    if (!email) {
        setTimeout(() => navigate("/forgot-password"), 0);
        return null;
    }

    const handleReset = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        setIsLoading(true);

        try {
            await api.post("/auth/reset-password", {
                email,
                code,
                newPassword
            });
            toast.success("Password updated successfully! You can log in.");
            navigate("/login");
        } catch (error) {
            const msg = error.response?.data?.message || "Reset failed";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className='post-form-container' style={{ maxWidth: '400px' }}>
            <div className='post-form-card'>
                <h1 className='post-form-title'>Reset Password</h1>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                    Enter the code sent to address <b>{email}</b> and your new password.
                </p>

                <form onSubmit={handleReset}>
                    <div className='form-group'>
                        <label>Code</label>
                        <input
                            type="text"
                            className='form-input'
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder='531431'
                            maxLength={6}
                            required
                            style={{ textAlign: 'center', letterSpacing: '3px', fontSize: '1.1rem' }}
                        />
                    </div>

                    <div className='form-group'>
                        <label>New Password</label>
                        <input
                            type="password"
                            className='form-input'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder='Password'
                            required
                            minLength={6}
                        />
                    </div>

                    <div className='form-group'>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            className='form-input'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder='Repeat Password'
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={isLoading} style={{ width: '100%' }}>
                        {isLoading ? '....' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPasswordPage
