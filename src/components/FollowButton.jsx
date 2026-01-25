import React, {useState} from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import '../styles/FollowButton.css'

function FollowButton({targetUserId, isFollowingInitial, onFollowChange}) {
    const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollowToggle = async()=>{
        if(isLoading) return;
        setIsLoading(true);
        try{
            const response = await api.put(`/users/${targetUserId}/follow`);
            const newStatus = response.data.isFollowing;
            setIsFollowing(newStatus);
            
            if(newStatus) toast.success("Followed successfully");
            else toast.success("Unfollowed successfully");
            if(onFollowChange) onFollowChange(newStatus);

        }catch(error){
            const errorMessage = error.response?.data?.message || error.message || "Error";
            toast.error(errorMessage);
        }finally{
            setIsLoading(false);
        }
    }

    return (
        <button className={`follow-btn ${isFollowing ? 'state-following' : 'state-follow'}`} onClick={handleFollowToggle} disabled={isLoading}>
            {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
        </button>
    )
}

export default FollowButton
