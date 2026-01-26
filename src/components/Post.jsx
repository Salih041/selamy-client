import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import "../styles/postCard.css"
import {formatRelativeTime} from "../utils/dateFormater"

function Post({ postProps }) {
    const { _id, title, content, comments, commentCount, like, likeCount, author, createdAt, tags , slug, statu, isEdited, editedAt, firstPublishDate} = postProps;
    const formattedDate = formatRelativeTime(firstPublishDate)
    const navigate = useNavigate();

    const stripHtml = (html) => {
        let modifiedHtml = html.replace(/<\/(p|div|h[1-6]|li|ul|ol|tr)>/gi, ' ');
        modifiedHtml = modifiedHtml.replace(/<br\s*\/?>/gi, ' ');
        const doc = new DOMParser().parseFromString(modifiedHtml, 'text/html');
        let text = doc.body.textContent || "";
        return text.replace(/\s+/g, ' ').trim();
    };
    const plainText = stripHtml(content);

    const handleCardClick = () => {
        navigate(`/posts/${slug || _id}`)
    }

    const handleTagClick = (e, tag) => {
        e.stopPropagation();
        navigate(`/?tag=${tag}`);
    }

    return (
        <article className={'post-card'+ (statu==='draft' ? ' draft-post': '')} onClick={handleCardClick}>
            <h2 className='post-card__title'> {title} </h2>
            
            <div className='post-card__meta'>
                <div className="post-card-avatar">
                    {author.profilePicture ? (
                        <img src={author.profilePicture} alt={author.username} />
                    ) : (
                        <span>{author.username.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <span className='post-card__author'><NavLink to={`/profile/${author._id}`} className={"post-card__author_username"} onClick={(e) => { e.stopPropagation() }}>{author.displayName}</NavLink></span>
                <span> • </span>
                <span className='post-card__post-date'>{formattedDate}</span>
                {isEdited && (<>
                <span>•</span>
                <span style={{ fontStyle: 'italic', color: '#666', fontWeight:"100" }}>Edited {formatRelativeTime(editedAt)}</span>
            </>)}
            </div>

            <p className='post-card__content'>
                {plainText}
            </p>

            {tags && tags.length > 0 && (
                <div className='post-card__tags'>
                    {tags.map((tag, index) => (
                        <span key={index} className='post-card__tag' onClick={(e) => handleTagClick(e, tag)}>#{tag}</span>
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
