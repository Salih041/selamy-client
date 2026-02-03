import { Link } from 'react-router-dom';
import { MdClose } from "react-icons/md";
import '../styles/UserListModal.css';

function UserListModal({ title, users, onClose }) {

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close-btn" onClick={onClose}>
                        <MdClose size={24}/>
                    </button>
                </div>

                <div className="modal-body">
                    {users.length > 0 ? (
                        users.map(user => {
                            if (typeof user === 'string') return null;
                            return (
                            <div key={user._id} className="modal-user-item">
                                <div className="modal-user-avatar">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.username} />
                                    ) : (
                                        <span>{user.username.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>

                                <div className="modal-user-info">
                                    <Link to={`/profile/${user._id}`} className="modal-user-link" onClick={onClose}>
                                        {user.displayName || user.username}
                                    </Link>
                                    <span className="modal-user-username">@{user.username}</span>
                                </div>
                            </div>
                        )})
                    ) : (
                        <p className="modal-empty">Empty.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserListModal
