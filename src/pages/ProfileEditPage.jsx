import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from "../api";
import toast from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";
import "../styles/ProfilPage.css";

function ProfileEditPage() {

    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, logout } = useAuth();

    const [bio, setBio] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState("");

    useEffect(() => {
        if (userId && userId !== id) {
            toast.error("Unauthorized!");
            navigate("/");
        }
    }, [userId, id, navigate]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get(`/users/${id}`);
                setBio(res.data.bio || "");
                setDisplayName(res.data.displayName || res.data.username);
                setUsername(res.data.username);
                setPreviewImage(res.data.profilePicture || null);
            } catch (error) {
                console.error(error);
                toast.error("Information could not be loaded");
            }
        };
        fetchUserData();
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('bio', bio);

        const finalDisplayName = displayName.trim() === "" ? username : displayName
        formData.append('displayName', finalDisplayName);
        if (imageFile) {
            formData.append('profilePicture', imageFile);
        }

        try {
            await api.put(`/users/update/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDisplayName(finalDisplayName)
            toast.success("Profie Updated!");
            navigate(`/profile/${id}`);
        } catch (error) {
            console.error(error);
            toast.error("Update failed.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteAccount = async () => {
        if (window.confirm("ARE YOU SURE? Your account and your posts will be permanently deleted!")) {
            try {
                setIsLoading(true);
                await api.delete(`/users/${id}`);
                toast.success("Your account has been deleted.")

                logout();
                navigate("/");
            } catch (error) {
                console.error(error);
                toast.error("Account couldnt be deleted")
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        }
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Update Profile</h1>

                <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px' }}>
                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            className="form-input"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={50}
                            placeholder="Name"
                        />
                    </div>

                    <div className='profile-upload-wrapper'>
                        <div className="profile-avatar">
                            {previewImage ? (
                                <img src={previewImage} alt="Avatar" />
                            ) : (
                                <span>?</span>
                            )}
                        </div>

                        <label className="submit-btn">
                            Select Image
                            <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Biography</label>
                        <textarea
                            className="form-textarea"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Introduce yourself..."
                            maxLength={140}
                        />
                        <small>{bio.length}/140</small>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate(`/profile/${id}`)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update'}
                        </button>
                    </div>

                    <div style={{ marginTop: '140px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: '#777', marginBottom: '10px' }}>
                            This action cannot be reversed.
                        </p>
                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            style={{
                                border: '1px solid #e74c3c',
                                color: '#e74c3c',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                            }}
                            className='post-edit--delete-btn'
                        >
                            Permanently Delete My Account 🗑️
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProfileEditPage
