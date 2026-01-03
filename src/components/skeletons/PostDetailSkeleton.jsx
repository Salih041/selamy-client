import React from 'react'
import Skeleton from 'react-loading-skeleton'
import "../../styles/PostDetail.css"
import 'react-loading-skeleton/dist/skeleton.css'

function PostDetailSkeleton() {
    return (
        <div className='Post-detail-wrapper'>
            <article className='full-post-artice'>

                <header className='post-header'>
                    <h1 className='post-title'><Skeleton width={"100%"}/></h1>
                    <div className='post-meta'>
                        <div>
                            <Skeleton circle={true} height={40} width={40} />
                        </div>
                        <span>
                            <Skeleton width={100} />
                        </span>
                        <span>•</span>
                        <span><Skeleton width={100}/></span>
                    </div>
                </header>

                <div className='post-content'>
                    <Skeleton count={10} />
                </div>
            </article>
        </div >
    )
}

export default PostDetailSkeleton