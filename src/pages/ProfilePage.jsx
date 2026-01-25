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
import NotFoundPage from "./NotFoundPage";


function ProfilePage() {
    const { id } = useParams();
    const { userId, user } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("published");
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [currentContent, setCurrentContent] = useState([]);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, limit: 20, totalResults: 0 })

    const isOwnProfile = userId === id;

    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            try {
                const userRes = await api.get(`/users/${id}`);
                setProfileUser(userRes.data)
            } catch (error) {
                setError(error?.response?.data?.message);
            } finally {
                //setIsLoading(false);
            }
        }
        fetchUserProfile();
    }, [id,userId]);

    useEffect(() => {
        const fetchContent = async () => {
            if (!id) return;
            //setIsLoading(true);
            setCurrentContent([]);
            try {
                let endpoint = "";
                switch (activeTab) {
                    case "published":
                        endpoint = `/posts/user/${id}?page=${page}&limit=20`;
                        break;
                    case "drafts":
                        if (isOwnProfile) endpoint = `/posts/my-drafts?page=${page}&limit=20`;
                        break;
                    case "bookmarks":
                        if (isOwnProfile) endpoint = `/posts/my-saved?page=${page}&limit=20`;
                        break;
                    case "liked":
                        if (isOwnProfile) endpoint = `/posts/my-liked?page=${page}&limit=20`;
                        break;
                    default:
                        endpoint = `/posts/user/${id}?page=${page}&limit=20`;
                        break;
                }
                if (endpoint) {
                    const response = await api.get(endpoint);
                    setCurrentContent(response.data.data)
                    setUserPosts(response.data.data);
                    setPagination(response.data.pagination)
                }

            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "Error";
                setError(errorMessage);
                toast.error(errorMessage)
                setCurrentContent([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchContent();
    }, [id, userId, page, activeTab]);

    useEffect(() => {
        setPage(1);
    }, [activeTab])

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== page) {
            setPage(newPage);
        }
    }

    const handleBanUser = async () => {
        try {
            if (profileUser.role !== 'admin' && user.role === 'admin') {
                if (window.confirm("Are you sure you want to ban " + profileUser.username + " ?")) {
                    await api.put(`/users/ban-account/${profileUser._id}`);
                    toast.success("User banned successfully");
                }
            } else {
                toast.error("You do not have permission to ban this user");
            }

        } catch (error) {
            console.error("Ban user error: ", error.message);
            toast.error("Failed to ban user");
        }
    }

    if (isLoading || !profileUser) return <ProfileSkeleton />
    if (error) {
        if (error.toLowerCase().includes("user not found")) return (<NotFoundPage />)
        return (<p>Error: {error}</p>)
    }
    if (!profileUser) return (<NotFoundPage />)

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
                {!isOwnProfile && (<button onClick={() => setIsReportOpen(true)} className="profile-report-trigger-btn" title="Report this post">
                    <FaRegFlag />
                </button>)}
                {!isOwnProfile && profileUser.role !== 'admin' && user && user.role === 'admin' && (
                    <button className="ban-user-button" onClick={handleBanUser}>BAN</button>
                )}
                <div className="profile-info">

                    <h1 className="profile-username">
                        {profileUser.displayName}
                    </h1>
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


            <div className="profile-posts-section">
                <h2 className="profile-posts-section_Posts-header">Posts</h2>
                <div className="profile-posts-container">
                    {currentContent.length > 0 ? (
                        currentContent.map(post => (
                            <Post key={post._id} postProps={post} />
                        ))
                    ) :
                        (
                            <p className="no-post-p">No Post</p>
                        )}
                </div>
            </div>


            {!isLoading && currentContent.length > 0 && pagination.totalPages > 1 && (
                <div className='home__controls'>
                    <button style={{color: 'black'}} onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                        &#x2190;
                    </button>
                    <span>Page {page} / {pagination.totalPages}</span>
                    <button style={{color: 'black'}} onClick={() => handlePageChange(page + 1)} disabled={page === pagination.totalPages}>
                        &#x2192;
                    </button>
                </div>
            )}

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