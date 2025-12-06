import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import Post from "../components/Post";
import toast from "react-hot-toast";
import "../styles/ProfilPage.css";
import { FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";

function ProfilePage() {
    const { id } = useParams();
    const { userId } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("published");
    const [userDrafts, setUserDrafts] = useState([]);

    const isOwnProfile = userId === id;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setIsLoading(true);

                const userRes = await api.get(`/users/${id}`);
                setProfileUser(userRes.data)

                const userPostRes = await api.get(`/posts/user/${id}`);
                setUserPosts(userPostRes.data);

                if (userId === id) {
                    const userDraftRes = await api.get(`/posts/my-drafts`);
                    setUserDrafts(userDraftRes.data);
                }
            } catch (error) {
                console.error("Profile error: ", error);
                const errorMessage = error.response?.data?.message || error.message || "Error";
                setError(errorMessage);
                toast.error(errorMessage)
            } finally {
                setIsLoading(false);
            }
        }
        fetchProfileData();
    }, [id, userId])

    if (!profileUser) return <p>User not found</p>
    if (isLoading) return <p> Loading </p>

    return (
        <div className="profile-container">
            <div className="profile-header">

                <div className="profile-avatar" style={{ overflow: 'hidden' }}>
                    {profileUser.profilePicture ? (
                        <img
                            src={profileUser.profilePicture}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        profileUser.username.charAt(0).toUpperCase()
                    )}
                </div>

                <div className="profile-info">
                    <h1 className="profile-username">
                        {profileUser.displayName}
                        {profileUser.role === 'admin' && (
                            <span className="admin-badge" title="Admin">
                                &#9733;
                            </span>
                        )}
                        {isOwnProfile && (
                            <Link className="edit-profile-button" to={`/profile/edit/${id}`}>
                                Edit
                            </Link>
                        )}
                    </h1>
                    <p style={{ color: '#888', margin: '-5px 0 10px 0', fontSize: '0.9rem' }}>
                        @{profileUser.username}
                    </p>

                    {profileUser.bio && (
                        <p className="profile-bio-text">
                            "{profileUser.bio}"
                        </p>
                    )}

                    <div className="profile-socials">
                        {profileUser.socials?.x && (
                            <a href={profileUser.socials.x} target="_blank" rel="noopener noreferrer">
                                <FaTwitter size={20} />
                            </a>)}
                        {profileUser.socials?.instagram && (
                            <a href={profileUser.socials.instagram} target="_blank" rel="noopener noreferrer">
                                <FaInstagram size={20} />
                            </a>)}
                        {profileUser.socials?.github && (
                            <a href={profileUser.socials.github} target="_blank" rel="noopener noreferrer">
                                <FaGithub size={20} />
                            </a>)}
                    </div>

                    <p className="profile-join-date">{new Date(profileUser.createdAt).toLocaleDateString('tr-TR')}</p>
                    <div className="profile-stats">
                        <span><strong>{userPosts.length}</strong> Posts</span>
                    </div>
                </div>
            </div>
            <hr className="profile-divider" />

            <div className="profile-tabs">
                {isOwnProfile && (
                    <div>
                        <button className={"tab-btn" + (activeTab === "published" ? " active" : "")} onClick={() => setActiveTab("published")}>
                            Published
                        </button>
                        <button className={"tab-btn" + (activeTab === "drafts" ? " active" : "")} onClick={() => setActiveTab("drafts")}>
                            Drafts
                        </button>
                    </div>
                )}
            </div>
            {/*published posts */}
            {activeTab === "published" && (
                <div className="profile-posts-section">
                    <h2 className="profile-posts-section_Posts-header">Posts</h2>
                    <div className="profile-posts-container">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <Post key={post._id} postProps={post} />
                            ))
                        ) :
                            (
                                <p className="no-post-p">This user has not posted yet</p>
                            )}
                    </div>
                </div>
            )
            }

            {/*draft posts */}
            {isOwnProfile && activeTab === "drafts" && (
                <div className="profile-posts-section">
                    <h2 className="profile-posts-section_Posts-header">Drafts</h2>
                    <div className="profile-posts-container">
                        {userDrafts.length > 0 ? (
                            userDrafts.map(post => (
                                <Post key={post._id} postProps={post} />
                            ))
                        ) :
                            (
                                <p className="no-post-p">You have no drafts yet</p>
                            )}
                    </div>
                </div>
            )
            }

        </div>
    )
}

export default ProfilePage;