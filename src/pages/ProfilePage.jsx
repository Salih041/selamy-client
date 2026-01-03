import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import Post from "../components/Post";
import toast from "react-hot-toast";
import "../styles/ProfilPage.css";
import { FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";
import FollowButton from "../components/FollowButton";
import UserListModal from "../components/UserListModal";
import { FaRegFlag } from "react-icons/fa6";
import ReportModal from "../components/ReportModal";
import ProfileSkeleton from "../components/skeletons/ProfileSkeleton";

function ProfilePage() {
    const { id } = useParams();
    const { userId } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("published");
    const [userDrafts, setUserDrafts] = useState([]);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [userBookmarks, setUserBookmarks] = useState([]);
    const [userLikedPosts, setUserLikedPosts] = useState([]);
    const [isReportOpen, setIsReportOpen] = useState(false);

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

                    const userSavedRes = await api.get(`/posts/my-saved`);
                    setUserBookmarks(userSavedRes.data);

                    const userLikedRes = await api.get(`/posts/my-liked`);
                    setUserLikedPosts(userLikedRes.data);
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
    if (isLoading) return <ProfileSkeleton />

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar-container">
                    <div className={`profile-avatar ${profileUser.role === 'admin' ? 'admin' : ''}`} style={{ overflow: 'hidden' }}>
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
                    {profileUser.username === 'sahoni' && (
                        <span className="admin-badge" title="Admin">
                            &#9733;
                        </span>
                    )}
                </div>

                <div className="profile-info">
                    {!isOwnProfile && (<button style={{ fontSize: "1.5rem", position: "absolute", top: "0px", right: "0px", zIndex: "9999" }} onClick={() => setIsReportOpen(true)} className="report-trigger-btn" title="Report this post">
                        <FaRegFlag />
                    </button>)}

                    <h1 className="profile-username">
                        {profileUser.displayName}

                        {isOwnProfile ? (
                            <Link className="edit-profile-button" to={`/profile/edit/${id}`}>
                                Edit
                            </Link>
                        ) : (
                            <FollowButton targetUserId={id} isFollowingInitial={profileUser.followers?.some(follower => {
                                const followerId = follower._id ? follower._id : follower;
                                return followerId.toString() === userId?.toString();
                            })}></FollowButton>
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
                        <span onClick={() => { if (profileUser.followers.length > 0) setShowFollowersModal(true) }}><strong>{profileUser.followers?.length || 0}</strong> Followers</span>
                        <span onClick={() => { if (profileUser.following.length > 0) setShowFollowingModal(true) }}><strong>{profileUser.following?.length || 0}</strong> Following</span>
                        <br /><br />
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
                        <button className={"tab-btn" + (activeTab === "liked" ? " active" : "")} onClick={() => setActiveTab("liked")}>
                            Liked
                        </button>
                        <button className={"tab-btn" + (activeTab === "bookmarks" ? " active" : "")} onClick={() => setActiveTab("bookmarks")}>
                            Bookmarks
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

            {/*bookmarks*/}
            {isOwnProfile && activeTab === "bookmarks" && (
                <div className="profile-posts-section">
                    <h2 className="profile-posts-section_Posts-header">Bookmarks</h2>
                    <div className="profile-posts-container">
                        {userBookmarks.length > 0 ? (
                            userBookmarks.map(post => (
                                <Post key={post._id} postProps={post} />
                            ))
                        ) :
                            (
                                <p className="no-post-p">You have no bookmark yet</p>
                            )}
                    </div>
                </div>
            )
            }

            {/*liked*/}
            {isOwnProfile && activeTab === "liked" && (
                <div className="profile-posts-section">
                    <h2 className="profile-posts-section_Posts-header">Liked</h2>
                    <div className="profile-posts-container">
                        {userLikedPosts.length > 0 ? (
                            userLikedPosts.map(post => (
                                <Post key={post._id} postProps={post} />
                            ))
                        ) :
                            (
                                <p className="no-post-p">You have not liked a post yet</p>
                            )}
                    </div>
                </div>
            )
            }

            {showFollowersModal && (
                <UserListModal title="Followers" users={profileUser.followers} onClose={() => { setShowFollowersModal(false) }} />
            )}
            {showFollowingModal && (
                <UserListModal title="Following" users={profileUser.following} onClose={() => { setShowFollowingModal(false) }} />
            )}
            {isReportOpen && (<ReportModal isOpen={isReportOpen} onClose={() => { setIsReportOpen(false) }} targetId={profileUser._id} targetType='User' />)}
        </div>
    )
}

export default ProfilePage;