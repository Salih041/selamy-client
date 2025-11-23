import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from "../api";
import toast from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";
import "../styles/ProfilPage.css";

function ProfileEditPage() {

    const { id } = useParams();
    const navigate = useNavigate();
    const { userId } = useAuth();

    const [bio, setBio] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
        if (imageFile) {
            formData.append('profilePicture', imageFile);
        }

        try {
            await api.put(`/users/update/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profie Updated!");
            navigate(`/profile/${id}`);
        } catch (error) {
            console.error(error);
            toast.error("Update failed.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Update Profile</h1>

                <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px' }}>

                    <div className='profile-upload-wrapper'>
                        <div className="profile-avatar">
                            {previewImage ? (
                                <img src={previewImage} alt="Avatar"/>
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
                </form>
            </div>
        </div>
    )
}

export default ProfileEditPage
