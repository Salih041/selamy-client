import React from 'react'
import Skeleton from 'react-loading-skeleton'
import "../../styles/postCard.css"
import 'react-loading-skeleton/dist/skeleton.css'

function PostSkeleton({ cards = 1 }) {
    return (
        Array(cards).fill(0).map((_, index) => (
            <article className='post-card' key={index} style={{ marginBottom: '20px' }}>
                <h2 className='post-card__title'><Skeleton height={25} width="70%" /></h2>

                <div className='post-card__meta'>
                    <span className='post-card__author'><Skeleton width={100} /></span>
                    <span> • </span>
                    <span className='post-card__post-date'><Skeleton width={80} /></span>
                </div>

                <p className='post-card__content'>
                    <Skeleton count={3} />
                </p>

                <Skeleton width={60} height={25} borderRadius={15} inline={true} style={{ marginRight: '5px' }} />
                <Skeleton width={70} height={25} borderRadius={15} inline={true} style={{ marginRight: '5px' }} />

                <footer className='post-card__footer'>
                    <div className="post-card__stat">
                        <Skeleton width={40} />
                    </div>

                    <div className="post-card__stat">
                        <Skeleton width={60} />
                    </div>
                </footer>
            </article>
        ))
    )
}

export default PostSkeleton
