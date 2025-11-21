import React from 'react'
import { NavLink } from 'react-router-dom';
import "../styles/postCard.css"

function Post({ postProps }) {
    const { _id, title, content, comments, commentCount, like, likeCount, author, createdAt, tags } = postProps;
    const formattedDate = new Date(createdAt).toLocaleDateString('tr-TR');

    return (
        <article className='post-card'>
            <h2 className='post-card__title'><NavLink to={`/posts/${_id}`}>{title}</NavLink></h2>

            <div className='post-card__meta'>
                <span className='post-card__author'>by <NavLink className={"post-card__author_username"}>{author.username}</NavLink></span>
                <span> • </span>
                <span className='post-card__post-date'>{formattedDate}</span>
            </div>

            <p className='post-card__content'>
                {content.length > 250 ? content.substring(0, 250) + "..." : content}
            </p>

            {tags && tags.length > 0 && (
                <div className='post-card__tags'>
                    {tags.map((tag, index) => (
                        <span key={index} className='post-card__tag'>#{tag}</span>
                    ))}
                </div>
            )}

            <footer className='post-card__footer'>
                <div className="post-card__stat">
                    <span>❤️</span> {likeCount} Like
                </div>

                <div className="post-card__stat">
                    <span>💬</span> {commentCount} Comment
                </div>
            </footer>
        </article>
    )
}

export default Post
