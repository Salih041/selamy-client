import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/FloatingButton.css';

function FloatingPostButton() {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    if (!isLoggedIn) return null;
    return (
        <button
            className="floating-post-btn"
            onClick={() => navigate('/create-post')}
            title="Create New Post"
        >
            +
        </button>
    );
}

export default FloatingPostButton
