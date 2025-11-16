import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, NavLink } from 'react-router-dom'
import api from "../api"
import { useAuth } from '../context/AuthContext'

function PostDetailsPage() {

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoggedIn, userId } = useAuth();

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
      alert("Please LOGIN")
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
      setCommentText("");
    } catch (error) {
      console.error("Comment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return (<p>Loading</p>)
  if (error) return (<p>Error: {error}</p>)
  if (!post) return (<h4>Post Not Found</h4>)

  const hasLiked = post.likes.includes(userId);
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.author.username}</p>
      <p>{post.content}</p>
      <footer>
        <p>
          <button onClick={handleLike} disabled={!isLoggedIn}>
            {/* Artık dinamik bir metin göster */}
            {hasLiked ? '🌧️ Undo' : 'Like'}
          </button>
          {post.likeCount} Like
        </p>
      </footer>
      <p>⛈️{post.commentCount}</p>
      {isLoggedIn ? (
        <form onSubmit={handleCommentSubmit}>
          <textarea
            rows="3"
            placeholder="Write..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '...' : 'Submit'}
          </button>
        </form>
      ) : (
        <p>Login<NavLink to="/login">to comment⛈️</NavLink>.</p>
      )}
    </div>
  )
}

export default PostDetailsPage
