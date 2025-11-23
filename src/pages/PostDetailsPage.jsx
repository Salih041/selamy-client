import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, NavLink, useNavigate } from 'react-router-dom'
import api from "../api"
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import DOMPurify from 'dompurify';
import "../styles/PostDetail.css"

function PostDetailsPage() {

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoggedIn, userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setError(null);
        setIsLoading(true);

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
    fetchPost();
  }, [id])


  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.warn("Please Login")
      return
    }
    try {
      const response = await api.put(`/posts/${id}/like`);
      setPost(prevPost => ({
        ...prevPost,
        likeCount: response.data.likeCount,
        likes: response.data.likes
      }));
    } catch (error) {
      console.error("Like error : ", error);
    }
  }

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

  const handleLikeComment = async (comment_id) => {
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
  }

  if (isLoading) return (<p>Loading</p>)
  if (error) return (<p>Error: {error}</p>)
  if (!post) return (<h4>Post Not Found</h4>)

  const hasLiked = post.likes.includes(userId);
  const isOwner = isLoggedIn && userId === post.author._id;
  return (
    <div className='Post-detail-wrapper'>
      <article className='full-post-artice'>
        {isOwner && (
          <div className='owner-controls'>
            <span>Author Panel:</span>
            <NavLink className="link-edit" to={`/posts/edit/${post._id}`}>Edit Post</NavLink>
            <button className='button-delete' onClick={handleDeletePost}>Delete Post</button>
          </div>
        )}

        <header className='post-header'>
          <h1 className='post-title'>{post.title}</h1>
          <div className='post-meta'>
            <span>by <NavLink to={`/profile/${post.author._id}`}>{post.author.username}</NavLink></span>
            <span>•</span>
            <span>📅 {new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
        </header>

        <div className='post-content' dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(post.content) 
            }}>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags-container">
            {post.tags.map((tag, index) => (
              <span key={index} className="post-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <footer className='post-footer'>
          <button className='like-button' onClick={handleLike} disabled={!isLoggedIn} style={{ color: hasLiked ? '#e74c3c' : '', borderColor: hasLiked ? '#e74c3c' : '' }}>
            {hasLiked ? '❤️ Liked' : '🤍 Like'}
          </button>
          <span><strong>{post.likeCount}</strong>Likes</span>
        </footer>
      </article>

      <section className='comment-section'>
        <h2>Comments {post.commentCount}</h2>

        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit} className='comment-form'>
            <textarea rows="3" placeholder='Write your comments' value={commentText} onChange={(e) => { setCommentText(e.target.value) }} required ></textarea>
            <button type='submit' disabled={isSubmitting}>{isSubmitting ? '...' : 'Comment'}</button>
          </form>
        ) : (
          <p style={{ marginBottom: '20px' }}>
            <NavLink to="/login" style={{ color: '#3498db' }}>Login</NavLink> to comment.
          </p>)}

        <div className='comment-list'>
          {
            post.commentCount > 0 ? (
              post.comments.toReversed().map(comment => {
                const hasLikedComment = comment.likes.includes(userId);
                return (
                  <article key={comment._id} className='comment-bubble'>
                    <strong className="comment-author"><NavLink to={`/profile/${comment.author._id}`}>
                      {comment.author.username}</NavLink></strong>
                    <p className="comment-text">{comment.text}</p>
                    <div className="comment-actions">
                      <button
                        className="comment-like-btn"
                        onClick={() => handleLikeComment(comment._id)}
                        disabled={!isLoggedIn}
                      >
                        {hasLikedComment ? '❤️' : '🤍'} Like
                      </button>
                      <span>{comment.likeCount}</span>
                      <span style={{ marginLeft: '10px' }}>• {new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </article>
                )
              })
            ) : (<p style={{ color: '#777', fontStyle: 'italic' }}>There are no comment</p>)
          }
        </div>
      </section>
    </div >
  )
}

export default PostDetailsPage
