import React, {useState,useEffect} from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Post from "../components/Post";
import toast from "react-hot-toast";
import "../styles/ProfilPage.css";

function ProfilePage(){
    const {id} = useParams();
    const [profileUser, setProfileUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(()=>{
        const fetchProfileData = async ()=>{
            try{
                setIsLoading(true);

                const userRes = await api.get(`/users/${id}`);
                setProfileUser(userRes.data)

                const userPostRes = await api.get(`/posts/user/${id}`);
                setUserPosts(userPostRes.data);
            }catch(error)
            {
                console.error("Profile error: " ,error);
                setError(error);
                toast.error(error)
            }finally{
                setIsLoading(false);
            }
        }
        fetchProfileData();
    },[id])

    if(!profileUser) return <p>User not found</p>
    if(isLoading) return <p> Loading </p>

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {profileUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                    <h1 className="profile-username">{profileUser.username}</h1>
                    <p className="profile-join-date">{new Date(profileUser.createdAt).toLocaleDateString('tr-TR')}</p>
                    <div className="profile-stats">
                        <span><strong>{userPosts.length}</strong> Posts</span>
                    </div>
                </div>
            </div>
            <hr className="profile-divider" />
            <div className="profile-posts-section">
                <h2 className="profile-posts-section_Posts-header">Posts</h2>
                <div className="profile-posts-container">
                    {userPosts.length >0 ? (
                        userPosts.map(post => (
                            <Post key={post._id} postProps={post}/>
                        ))
                    ):
                    (
                        <p className="no-post-p">This user has not posted yet</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProfilePage;