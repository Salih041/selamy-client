import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import "../styles/PostDetail.css"
import { formatRelativeTime } from '../utils/dateFormater';
import UserListModal from './UserListModal';
import ReportModal from './ReportModal';
import { FaRegFlag } from "react-icons/fa6";


function CommentItem({ comment, postId, onCommentUpdated, onCommentDeleted, onReply }) {
    const MAX_COMMENT_LENGTH = 20000;
    const { userId, isLoggedIn, isAdmin } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [likes, setLikes] = useState(comment.likes || []);
    const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
    const [showCommentLikesModal, setShowCommentLikesModal] = useState(false);

    const [isReportOpen, setIsReportOpen] = useState(false);
    const navigate = useNavigate();

    const author = comment.author || {
        username: "Deleted User",
        displayName: "Deleted User",
        _id: null,
        profilePicture: null
    };

    const isAuthor = userId && author._id && userId === author._id;
    const canManage = isAuthor || isAdmin;

    const handleDelete = async () => {

        if (!isAdmin && isAuthor) {
            if (!window.confirm("Are you sure you want to delete this comment?")) return;
            try {
                await api.delete(`/posts/${postId}/comment/${comment._id}`);
                toast.success("Comment deleted");
                onCommentDeleted(comment._id);
            } catch (error) {
                toast.error("Failed to delete");
            }
        }
        if (isAdmin) {
            const reasonText = prompt("Reason : ");
            if (reasonText !== null) {
                try {
                    await api.delete(`/posts/${postId}/comment/${comment._id}`, {
                        params: {
                            reason: reasonText
                        }
                    });
                    toast.success("Comment Deleted")
                    onCommentDeleted(comment._id);
                } catch (error) {
                    toast.error(error?.message || "Error")
                }
            }
        }
    }

    const handleUpdate = async () => {
        if (!editText.trim()){
            toast.error("comment is required");
            return;
        }
        if(editText.trim() > MAX_COMMENT_LENGTH){
            toast.error("Comment is too long. max: "+MAX_COMMENT_LENGTH);
            return;
        }
        setIsSubmitting(true);
        try {
            await api.put(`/posts/${postId}/comment/${comment._id}`, { text: editText });
            toast.success("Comment Updated");
            setIsEditing(false);
            onCommentUpdated(comment._id, editText.trim());
        } catch (error) {
            toast.error("Failed to update.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleLike = async () => {
        if (!isLoggedIn) {
            toast.error("Please Login to like");
            return;
        }
        try {
            const response = await api.put(`/posts/${postId}/comment/${comment._id}/like`);

            setLikes(response.data.likes);
            setLikeCount(response.data.likeCount);

        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    const formattedText = comment.text.split(' ').map((word, i) => {
        if (word.startsWith('@')) return <span key={i} className="mention-text">{word} </span>;
        return word + ' ';
    });

    const isMentioned = comment.mentions && comment.mentions.some(id => id.toString() === userId);
    const hasLikedComment = likes.some(like => {
        const likeId = like._id ? like._id : like;
        return likeId.toString() === userId?.toString();
    });

    return (
        <article className={`comment-bubble ${isMentioned ? 'mentioned' : ''}`}>

            <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="comment-avatar">
                        {author.profilePicture ? (
                            <img src={author.profilePicture} alt="avatar" />
                        ) : (
                            <span>{author.username.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <strong className="comment-author" style={{ margin: 0 }}>
                        {author._id ? (
                            <NavLink to={`/profile/${author._id}`}>{author.displayName}</NavLink>
                        ) : (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>{author.displayName}</span>
                        )}
                    </strong>
                    <span id='comment-username-span'>
                        {author._id ? (
                            "@" + author.username
                        ) : (
                            ""
                        )}
                    </span>
                </div>

                {canManage && !isEditing && (
                    <div className="comment-controls" style={{ fontSize: '0.8rem', display: 'flex', gap: '10px' }}>
                        <button onClick={() => setIsEditing(true)} style={!isAuthor ? {
                            pointerEvents: 'none', opacity: 0.5, cursor: 'not-allowed', borderColor: '#ccc'
                        } : { border: 'none', background: 'none', cursor: 'pointer', color: '#3498db' }}>Edit</button>
                        <button onClick={handleDelete} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e74c3c' }}>Delete</button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="comment-edit-form" style={{ marginTop: '10px' }}>
                    <textarea
                        className="form-textarea"
                        maxLength={MAX_COMMENT_LENGTH}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{ minHeight: '60px', padding: '8px', fontSize: '0.9rem' }}
                    />
                    <div style={{ marginTop: '5px', display: 'flex', gap: '10px' }}>
                        <button className="submit-btn" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={handleUpdate} disabled={isSubmitting}>Save</button>
                        <button className="cancel-btn" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => { setIsEditing(false); setEditText(comment.text); }}>Cancel</button>
                    </div>
                </div>
            ) : (
                <p className="comment-text">{formattedText}</p>
            )}

            <div className="comment-actions">
                <button
                    className="comment-like-btn"
                    onClick={handleLike}
                    disabled={!isLoggedIn}
                    style={{
                        color: hasLikedComment ? '#e74c3c' : 'inherit',
                        fontWeight: hasLikedComment ? 'bold' : 'normal'
                    }}
                >
                    {hasLikedComment ? '❤️ Liked' : '🤍 Like'}
                </button>

                <span onClick={() => { if (comment.likeCount > 0) setShowCommentLikesModal(true) }} style={{
                    cursor: comment.likeCount > 0 ? 'pointer' : 'default',
                    fontWeight: 'bold',
                    fontStyle: comment.likeCount > 0 ? 'none' : 'italic'
                }}>{likeCount}</span>

                {isLoggedIn && !isAuthor && (
                    <button onClick={() => { onReply(author.username) }} style={{
                        background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', marginLeft: '10px'
                    }}>
                        Reply
                    </button>
                )}

                <span style={{ marginLeft: '10px' }}>• {formatRelativeTime(comment.createdAt)}</span>
                {!isAuthor && (<button style={{ fontSize: "1.1rem", marginLeft: "auto" }} onClick={() => setIsReportOpen(true)} className="report-trigger-btn" title="Report this post">
                    <FaRegFlag />
                </button>)}
            </div>
            {showCommentLikesModal && (
                <UserListModal title="Comment Likes" users={likes} onClose={() => { setShowCommentLikesModal(false) }} />
            )}
            {isReportOpen && (<ReportModal isOpen={isReportOpen} onClose={() => { setIsReportOpen(false) }} targetId={comment._id} targetType="Comment" targetPost={postId} />)}
        </article>

    );
}

export default CommentItem
