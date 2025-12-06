import React from 'react'
import { useState, useEffect, useRef} from 'react'
import { useParams, NavLink, useNavigate } from 'react-router-dom'
import api from "../api"
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import DOMPurify from 'dompurify';
import UserListModal from '../components/UserListModal'
import CommentItem from '../components/CommentItem'
import "../styles/PostDetail.css"
import { formatRelativeTime } from '../utils/dateFormater';

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  if ('target' in node) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});


function PostDetailsPage() {

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoggedIn, userId , isAdmin} = useAuth();

  const [showLikesModal, setShowLikesModal] = useState(false);
  const navigate = useNavigate();

  const commentInputRef = useRef(null);

  const fetchPostData = async () => {
    try {
      setError(null);

      const response = await api.get(`/posts/${id}`);

      setPost(response.data)
      console.log(response.data)

    } catch (error) {
      console.log("error : ", error);
      setError(error.response ? error.response.data.message : error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    fetchPostData();
  }, [id])


  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.warn("Please Login")
      return
    }
    try {
      await api.put(`/posts/${id}/like`);
      await fetchPostData();
    } catch (error) {
      console.error("Like error : ", error);
    }
  }

  const handleCommentDeleted = (commentId) => {
    setPost(prevPost => ({
      ...prevPost,
      comments: prevPost.comments.filter(c => c._id !== commentId),
      commentCount: prevPost.commentCount - 1
    }));
  };

  const handleCommentUpdated = (commentId, newText) => {
    setPost(prevPost => ({
      ...prevPost,
      comments: prevPost.comments.map(c =>
        c._id === commentId ? { ...c, text: newText } : c
      )
    }));
  };


  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);

    try {
      const response = await api.post(`/posts/${id}/comment`, {
        text: commentText
      });
      const newComment = response.data;

      setPost(prevPost => ({
        ...prevPost,
        comments: [...prevPost.comments, newComment],
        commentCount: prevPost.commentCount + 1
      }))
      toast.success("Comment Sent");
      setCommentText("");
    } catch (error) {
      console.error("Comment error:", err);
      toast.error(error.message || "Error")
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeletePost = async () => {
    if (!isOwner) {
      toast.error("Unauthorized")
      return;
    }
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/posts/${id}`);
        toast.success("Post Deleted")
        navigate("/");
      } catch (error) {
        console.error("Error: ", error)
        toast.error(error.message || "Error")
      }
    }
  }

  const handleReplyComment = (username) => {
    const mention = `@${username} `;
    setCommentText(prev => prev ? `${prev} ${mention}` : mention);
    if (commentInputRef.current) {
        commentInputRef.current.focus();
    }
  }

  /*const handleLikeComment = async (comment_id) => {
    if (!isLoggedIn) {
      toast.warn("Please Login")
      return
    }
    try {
      const response = await api.put(`/posts/${id}/comment/${comment_id}/like`);
      const { likeCount, likes } = response.data;
      setPost(prevPost => {
        const updatedComments = prevPost.comments.map(comment => {
          if (comment._id === comment_id) {
            return {
              ...comment,
              likeCount: likeCount,
              likes: likes
            }
          }
          return comment;
        });
        return {
          ...prevPost,
          comments: updatedComments
        }
      });
    } catch (error) {
      console.error("Like error : ", error);
    }
  }*/

  const handleTagClick = (e, tag) => {
    e.stopPropagation();
    navigate(`/?search=${tag}`);
  }

  if (isLoading) return (<p>Loading</p>)
  if (error) return (<p>Error: {error}</p>)
  if (!post) return (<h4>Post Not Found</h4>)

  const hasLiked = post.likes.some(like => (like._id || like).toString() === userId); 
  const isOwner = isLoggedIn && userId === post.author?._id;
  const canManage = isOwner || isAdmin;
  const authorExists = !!post.author;
  return (
    <div className='Post-detail-wrapper'>
      <article className='full-post-artice'>
        {canManage && (
          <div className='owner-controls'>
            <span>Author Panel:</span>
            <NavLink className="link-edit" to={`/posts/edit/${post._id}`}
            style={!isOwner ? { 
                    pointerEvents: 'none',
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    borderColor: '#ccc'
                } : {}}>Edit Post</NavLink>
            <button className='button-delete' onClick={handleDeletePost}>Delete Post</button>
          </div>
        )}

        <header className='post-header'>
          {post.statu === 'draft' && (<span className='draft-badge'>Draft</span>)}
          <h1 className='post-title'>{post.title}</h1>
          <div className='post-meta'>
            {authorExists && (<div className="comment-avatar">
              {post.author.profilePicture ? (
                <img src={post.author.profilePicture} alt="avatar" />
              ) : (
                <span>{post.author.username.charAt(0).toUpperCase()}</span>
              )}
            </div>)}

            <span>
              {authorExists ? (<NavLink to={`/profile/${post.author._id}`}>{post.author.displayName}</NavLink>) : (<span style={{ fontStyle: 'italic', color: '#999' }}>Deleted User</span>)}
            </span>
            <span>•</span>
            <span>📅 {formatRelativeTime(post.createdAt)}</span>
            {post.isEdited && (<>
              <span>•</span>
              <span style={{ fontStyle: 'italic', color: '#666' }}>Edited {formatRelativeTime(post.editedAt)}</span>
            </>)}
          </div>
        </header>

        <div className='post-content' dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(post.content)
        }}>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags-container">
            {post.tags.map((tag, index) => (
              <span key={index} className="post-tag" onClick={(e) => { handleTagClick(e, tag) }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <footer className='post-footer'>
          <button className='like-button' onClick={handleLike} disabled={!isLoggedIn} style={{ color: hasLiked ? '#e74c3c' : '', borderColor: hasLiked ? '#e74c3c' : '' }}>
            {hasLiked ? '❤️ Liked' : '🤍 Like'}
          </button>
          <span onClick={() => { if (post.likeCount > 0) setShowLikesModal(true) }} style={{
            cursor: post.likeCount > 0 ? 'pointer' : 'default',
            fontWeight: 'bold',
            fontStyle: post.likeCount > 0 ? 'none' : 'italic'
          }}><strong>{post.likeCount}</strong> Likes </span>
        </footer>
      </article>

      <section className='comment-section'>
        <h2>Comments {post.commentCount}</h2>

        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit} className='comment-form'>
            <textarea ref={commentInputRef} rows="3" placeholder='Write your comments' value={commentText} onChange={(e) => { setCommentText(e.target.value) }} required ></textarea>
            <button type='submit' disabled={isSubmitting}>{isSubmitting ? '...' : 'Comment'}</button>
          </form>
        ) : (
          <p style={{ marginBottom: '20px' }}>
            <NavLink to="/login" style={{ color: '#3498db' }}>Login</NavLink> to comment.
          </p>)}

        <div className='comment-list'>
          {
            post.commentCount > 0 ? (
              post.comments.toReversed().map(comment => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                  onCommentUpdated={handleCommentUpdated}
                  onCommentDeleted={handleCommentDeleted}
                  onReply={handleReplyComment}
                />
              ))
            ) : (<p style={{ color: '#777', fontStyle: 'italic' }}>There are no comment</p>)
          }
        </div>
      </section>
      {showLikesModal && (
        <UserListModal title="Likes" users={post.likes} onClose={() => { setShowLikesModal(false) }} />
      )}
    </div >
  )
}

export default PostDetailsPage
