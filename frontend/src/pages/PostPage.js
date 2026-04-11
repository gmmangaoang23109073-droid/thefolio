// frontend/src/pages/PostPage.js
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import '../App.css';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const { data } = await API.get(`/posts/${id}`);
      setPost(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await API.get(`/comments/${id}`);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments');
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await API.post(`/comments/${id}`, {
        body: newComment
      });
      setComments([...comments, data]);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await API.delete(`/posts/${id}`);
        navigate('/home');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete post');
      }
    }
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div className="not-found">Post not found</div>;

  // Check if current user can edit/delete this post
  const canEdit = user && (user._id === post.author?._id || user.role === 'admin');
  const canDelete = user && (user._id === post.author?._id || user.role === 'admin');

  // Helper function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL (Cloudinary), return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise assume it's a local filename
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  return (
    <div className="post-page">
      <article className="post-full">
        {post.image && (
          <div className="post-image-container">
            <img 
              src={getImageUrl(post.image)} 
              alt={post.title}
              className="post-image-full"
            />
          </div>
        )}

        <div className="post-header">
          <h1 className="post-title">{post.title}</h1>
          
          <div className="post-meta">
            <span className="post-author">
              By {post.author?.name || 'Unknown'}
            </span>
            <span className="post-date">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Show Edit and Delete buttons if user is author or admin */}
          {(canEdit || canDelete) && (
            <div className="post-actions">
              {canEdit && (
                <Link to={`/edit-post/${post._id}`} className="btn btn-edit">
                  ✏️ Edit Post
                </Link>
              )}
              {canDelete && (
                <button onClick={handleDeletePost} className="btn btn-delete">
                  🗑️ Delete Post
                </button>
              )}
            </div>
          )}
        </div>

        <div className="post-content">
          {post.body.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      {/* Comments Section */}
      <section className="comments-section">
        <h2 className="comments-title">Comments ({comments.length})</h2>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows="3"
              required
              className="comment-input"
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p className="login-prompt">
            <Link to="/login">Login</Link> to leave a comment
          </p>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="comment-item">
                <div className="comment-header">
                  <strong className="comment-author">
                    {comment.author?.name || 'Anonymous'}
                  </strong>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="comment-text">{comment.body}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default PostPage;