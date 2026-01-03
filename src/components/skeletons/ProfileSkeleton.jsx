import React from 'react'
import Skeleton from 'react-loading-skeleton'
import "../../styles/ProfilPage.css"
import 'react-loading-skeleton/dist/skeleton.css'

function ProfileSkeleton() {
    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar-container">
                    <Skeleton circle={true} height={100} width={100} />
                </div>
                <div className="profile-info">
                    <h1 className="profile-username">
                        <Skeleton width={200} />
                    </h1>
                    <Skeleton width={100}></Skeleton>
                    <br />
                    <Skeleton width={100}></Skeleton>
                    <Skeleton width={100} count={2}></Skeleton>
                </div>
            </div>
            <br /><hr /><br />
            <div className="profile-posts-section">
                <Skeleton height={30} width={200} />
                <div className="profile-posts-container">
                    <Skeleton count={5} />
                </div>
            </div>
        </div>
    )
}

export default ProfileSkeleton
