import { useState, useEffect, useRef } from 'react'
import { useParams, NavLink, useNavigate } from 'react-router-dom'
import api from "../api"
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import DOMPurify from 'dompurify';
import UserListModal from '../components/UserListModal'
import CommentItem from '../components/CommentItem'
import "../styles/PostDetail.css"
import { formatRelativeTime } from '../utils/dateFormater';
import FollowButton from '../components/FollowButton';
import { Helmet } from 'react-helmet-async'
import { IoShareOutline } from "react-icons/io5";
import { FaRegBookmark } from "react-icons/fa";
import { MdBookmarkAdded } from "react-icons/md";
import ReportModal from '../components/ReportModal'
import { FaRegFlag } from "react-icons/fa6";
import PostDetailSkeleton from '../components/skeletons/PostDetailSkeleton';
import NotFoundPage from './NotFoundPage'
import { useDebounce } from '../hooks/useDebounce'


DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  if ('target' in node) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});


function PostDetailsPage() {
  const MAX_COMMENT_LENGTH = 20000;
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoggedIn, userId, isAdmin } = useAuth();

  const [showLikesModal, setShowLikesModal] = useState(false);
  const navigate = useNavigate();

  const commentInputRef = useRef(null);

  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);

  const [likedState, setLikedState] = useState(false);
  const [likedCountState, setLikedCountState] = useState(0);
  const initialLikedStatus = useRef(false);
  const initialLikedCount = useRef(0);

  const fetchPostData = async () => {
    try {
      setError(null);

      const response = await api.get(`/posts/${id}`);

      setPost(response.data)

      if (isLoggedIn) {
        const currentUserResponse = await api.get(`/users/${userId}`);
        setCurrentUserFollowing(currentUserResponse.data.following || []);

        const savedList = currentUserResponse.data.savedPosts || [];
        const isPostSaved = savedList.some(saved => {
          const savedID = saved._id ? saved._id : saved;
          return savedID.toString() === response.data._id.toString();
        });
        setIsSaved(isPostSaved);
      }

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
  }, [id, isLoggedIn, userId])

  useEffect(() => {
    if (post) {
      const initialHasLiked = post.likes.some(like => (like._id || like).toString() === userId);
      setLikedState(initialHasLiked);
      setLikedCountState(post.likeCount);

      initialLikedStatus.current = initialHasLiked;
      initialLikedCount.current = post.likeCount;
    }
  }, [post, userId])

  const debouncedHandleLike = useDebounce(async (finalLikedStatus) => {
    if (finalLikedStatus === initialLikedStatus.current) { return; }
    try {
      await api.put(`/posts/${id}/like`);
      initialLikedStatus.current = finalLikedStatus;
      if (finalLikedStatus) initialLikedCount.current = initialLikedCount.current + 1;
      else initialLikedCount.current = initialLikedCount.current - 1;
    }
    catch (error) {
      toast.error(error?.message || "Error")
      setLikedState(initialLikedStatus.current);
      setLikedCountState(initialLikedCount.current);
    }
  }, 500)


  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.warn("Please Login")
      return
    }
    const newLikedStatus = !likedState
    setLikedState(newLikedStatus);
    setLikedCountState(prev => newLikedStatus ? prev + 1 : prev - 1);

    debouncedHandleLike(newLikedStatus)
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
    if (commentText.trim().length > MAX_COMMENT_LENGTH) {
      toast.error("Comment is too long. max: " + MAX_COMMENT_LENGTH);
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await api.post(`/posts/${id}/comment`, {
        text: commentText.trim()
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
      toast.error(error?.message || "Error")
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeletePost = async () => {
    if (!canManage) {
      toast.error("Unauthorized")
      return;
    }
    if (!isAdmin && isOwner) {
      if (window.confirm("Are you sure you want to delete this post?")) {
        try {
          await api.delete(`/posts/${id}`);
          toast.success("Post Deleted")
          navigate("/");
        } catch (error) {
          toast.error(error?.message || "Error")
        }
      }
    }
    if (isAdmin) {
      const reasonText = prompt("Reason : ");
      if (reasonText !== null) {
        try {
          await api.delete(`/posts/${id}`, {
            params: {
              reason: reasonText
            }
          });
          toast.success("Post Deleted")
          navigate("/");
        } catch (error) {
          toast.error(error?.message || "Error")
        }
      }
    }
  }

  const handleUnpublish = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const reasonText = prompt("Sebep : ");
    if (reasonText === null) setIsLoading(false);
    else {
      try {
        const response = await api.put(`/posts/${id}`, {
          title: post.title,
          content: post.content,
          tags: post.tagsArray,
          statu: "draft"
        }, {
          params: {
            reason: reasonText
          }
        });
        toast.success("Post Unpublished")
        const updatedPost = response.data;
        navigate(`/`);
      } catch (error) {
        setError(error?.response ? error.response.data.message : "Error.");
        toast.error(error?.message || "Error");
        setIsLoading(false);
      } finally {
        setIsLoading(false);
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

  const handleTagClick = (e, tag) => {
    e.stopPropagation();
    navigate(`/?tag=${tag}`);
  }

  const handleExternalLinkClick = (e) => {
    const link = e.target.closest('a');
    if (!link || !link.href) return;
    if (link.href.startsWith('http') || link.href.startsWith('https')) {
      e.preventDefault();
      const isConfirmed = window.confirm("Are you sure you want to go to :\n" + link.href)
      if (isConfirmed) {
        window.open(link.href, '_blank', 'noopener,noreferrer');
      }
    }
  }

  const handleSharePost = async () => {
    const shareUrl = `${window.location.origin}/posts/${post.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: "Check out this amazing post! : ",
          url: shareUrl,
        });
      } catch (error) {
        console.log("Share Error");
      }
    }
    else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
      }
      catch (error) {
        toast.error("Failed to copy link");
      }
    }
  }

  const handleBookmarkPost = async () => {
    if (!isLoggedIn) {
      toast.error("Please Login to save post");
      return;
    }
    try {
      const response = await api.put(`posts/${id}/save`);
      setIsSaved(!isSaved);
      toast.success(response.data.message);
    } catch (error) {
      setIsSaved(false);
      toast.error("Failed to mark")
    }
  }


  if (isLoading) return (<PostDetailSkeleton />)
  //if (error.status === 404) return (<NotFoundPage />)

  if (error) {
    if (error.toLowerCase() === "post not found") return (<NotFoundPage />)
    return (<p>Error: {error}</p>)
  }
  if (!post) return (<NotFoundPage />)


  //const hasLiked = post.likes.some(like => (like._id || like).toString() === userId);
  const isOwner = isLoggedIn && userId === post.author?._id;
  const canManage = isOwner || isAdmin;
  const authorExists = !!post.author;
  return (
    <div className='Post-detail-wrapper'>
      {
        post && (
          <Helmet>
            <title>{post.title} | SelamY</title>
            <meta name='description' content={post.content.substring(0, 150)} />
            <meta property="og:title" content={post.title} />
            <meta property="og:description" content={post.content.substring(0, 150)} />
            <meta property="og:url" content={`https://selamy.me/posts/${post._id}`} />
          </Helmet>
        )
      }
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
            {
              isAdmin && <button className="link-edit" onClick={handleUnpublish}>Unpublish</button>
            }
            <button className='button-delete' onClick={handleDeletePost}>Delete Post</button>
          </div>
        )}

        <header className='post-header'>
          {post.statu === 'draft' && (<span className='draft-badge'>Draft</span>)}
          <h1 className='post-title'>{post.title} </h1>
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
            <span>📅 {formatRelativeTime(post.firstPublishDate)}</span>
            {post.isEdited && (<>
              <span>•</span>
              <span style={{ fontStyle: 'italic', color: '#666' }}>Edited {formatRelativeTime(post.editedAt)}</span>
            </>)}
            {authorExists && userId !== post.author._id && (
              <FollowButton targetUserId={post.author._id} isFollowingInitial={currentUserFollowing?.some(followingUser => {
                const followingId = followingUser._id ? followingUser._id : followingUser;
                return followingId.toString() === post.author._id?.toString();
              })}></FollowButton>
            )}
            <button className='action-btn bookmark-btn' onClick={(e) => {
              e.preventDefault();
              handleBookmarkPost();
            }} title='Bookmark'> {isSaved ? <MdBookmarkAdded style={{ fontSize: "2rem" }} /> : <FaRegBookmark style={{ fontSize: "1.6rem" }} />}  </button>

            <button className="action-btn SAction" onClick={(e) => {
              e.preventDefault();
              handleSharePost();
            }} title='Action'><IoShareOutline /></button>

            {!isOwner && (<button onClick={() => setIsReportOpen(true)} className="report-trigger-btn" title="Report this post">
              <FaRegFlag />
            </button>)}

          </div>
        </header>

        <div className='post-content' onClick={handleExternalLinkClick} dangerouslySetInnerHTML={{
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
          <button className='like-button' onClick={handleLike} disabled={!isLoggedIn} style={{ color: likedState ? '#e74c3c' : '', borderColor: likedState ? '#e74c3c' : '' }}>
            {likedState ? '❤️ Liked' : '🤍 Like'}
          </button>
          <span onClick={() => { if (post.likeCount > 0) setShowLikesModal(true) }} style={{
            cursor: post.likeCount > 0 ? 'pointer' : 'default',
            fontWeight: 'bold',
            fontStyle: post.likeCount > 0 ? 'none' : 'italic'
          }}><strong>{likedCountState}</strong> Likes </span>
        </footer>
      </article>

      <section className='comment-section'>
        <h2>Comments {post.commentCount}</h2>

        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit} className='comment-form'>
            <textarea ref={commentInputRef} rows="3" placeholder='Write your comments' value={commentText} onChange={(e) => { setCommentText(e.target.value); }} required maxLength={MAX_COMMENT_LENGTH}></textarea>
            <span className='char-counter'>max {MAX_COMMENT_LENGTH} characters</span>
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
      {isReportOpen && (<ReportModal isOpen={isReportOpen} onClose={() => { setIsReportOpen(false) }} targetId={post._id} targetType="Post" targetPost={post._id} />)}
    </div >
  )
}

export default PostDetailsPage
