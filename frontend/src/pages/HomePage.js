// frontend/src/pages/HomePage.js
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import profilePic from "../images/me.jpg";
import "../App.css";

// Define backend URL based on environment
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://thefolio-mpb8.onrender.com' 
  : 'http://localhost:5000';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading posts...</p>;

  return (
    <div className="home-page">
      <section className="hero">
        <h2 className="title">WELCOME TO MY PERSONAL WEB BLOG</h2>
        <p className="name">Hi! I am Glaiza May B. Mangaoang</p>
        <img src={profilePic} className="profile-pic" alt="profile pic" />
        <p className="text">This website is all about my love for fashion.</p>
        <p className="text">Get to know me better!</p>
      </section>

      <section className="latest-posts">
        <h2>Latest Posts</h2>
        {posts.length === 0 ? (
          <p className="no-posts">No posts yet. Be the first to write one!</p>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                {post.image && (
                  <Link to={`/posts/${post._id}`}>
                    <img 
                      src={`${BACKEND_URL}/uploads/${post.image}`}
                      alt={post.title}
                      className="post-card-image"
                    />
                  </Link>
                )}
                <div className="post-card-content">
                  <h3>
                    <Link to={`/posts/${post._id}`} className="post-title-link">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="post-excerpt">
                    {post.body.length > 100 
                      ? post.body.substring(0, 100) + '...' 
                      : post.body}
                  </p>
                  <div className="post-card-footer">
                    <small>
                      By {post.author?.name || 'Unknown'} · {new Date(post.createdAt).toLocaleDateString()}
                    </small>
                    <Link to={`/posts/${post._id}`} className="read-more-btn">
                      Read More →
                    </Link>
                  </div>
                  {user && (user._id === post.author?._id || user.role === 'admin') && (
                    <Link to={`/edit-post/${post._id}`} className="btn-edit-small">
                      ✏️ Edit Post
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="previews">
        <h3>Explore More:</h3>
        <div className="previews-grid">
          <div className="preview-card">
            <h4>About Me</h4>
            <p>Learn about my fashion journey and personal style.</p>
            <Link to="/about" className="explore-link">Read More →</Link>
          </div>
          <div className="preview-card">
            <h4>Contact</h4>
            <p>Find out how to reach me for collaborations or questions.</p>
            <Link to="/contact" className="explore-link">Read More →</Link>
          </div>
          {!user && (
            <div className="preview-card">
              <h4>Register</h4>
              <p>Sign up to get updates and stay connected with my blog.</p>
              <Link to="/register" className="explore-link">Read More →</Link>
            </div>
          )}
        </div>
      </section>

      <section className="highlights">
        <h3>Key Highlights</h3>
        <ul>
          <li>Personal Style and Identity</li>
          <li>Self-Expression</li>
          <li>Inspiration and Influences</li>
          <li>Confidence Through Fashion</li>
          <li>Growth and Exploration</li>
        </ul>
      </section>
    </div>
  );
};

export default HomePage;