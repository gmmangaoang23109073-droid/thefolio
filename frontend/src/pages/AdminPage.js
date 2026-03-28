// frontend/src/pages/AdminPage.js
import { useState, useEffect } from 'react';
import API from '../api/axios';
import '../App.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingMessage, setViewingMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, postsRes, messagesRes] = await Promise.all([
          API.get('/admin/users'),
          API.get('/admin/posts'),
          API.get('/admin/messages'),
        ]);
        setUsers(usersRes.data);
        setPosts(postsRes.data);
        setMessages(messagesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleStatus = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/status`);
      setUsers(users.map((u) => (u._id === id ? data.user : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const removePost = async (id) => {
    try {
      await API.put(`/admin/posts/${id}/remove`);
      setPosts(posts.map((p) => (p._id === id ? { ...p, status: 'removed' } : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await API.delete(`/admin/messages/${id}`);
      setMessages(messages.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Open view modal for a message
  const openViewModal = (msg) => {
    setViewingMessage(msg);
    setShowViewModal(true);
  };

  // Open reply modal for a message
  const openReplyModal = (msg) => {
    setReplyingTo(msg);
    setReplyText('');
    setShowReplyModal(true);
  };

  // Send the reply
  const sendReply = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }
    setSending(true);
    try {
      await API.post(`/admin/messages/${replyingTo._id}/reply`, { reply: replyText });
      alert('Reply sent successfully!');
      setShowReplyModal(false);
      setReplyingTo(null);
      setReplyText('');
      // Optionally refresh messages to show reply inline? (if you later show replies in table)
    } catch (err) {
      console.error(err);
      alert('Failed to send reply. Check console for details.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>

      <div className="admin-tabs">
        <button
          onClick={() => setTab('users')}
          className={tab === 'users' ? 'active' : ''}
        >
          Members ({users.length})
        </button>
        <button
          onClick={() => setTab('posts')}
          className={tab === 'posts' ? 'active' : ''}
        >
          All Posts ({posts.length})
        </button>
        <button
          onClick={() => setTab('messages')}
          className={tab === 'messages' ? 'active' : ''}
        >
          Messages ({messages.length})
        </button>
      </div>

      {/* Users Table */}
      {tab === 'users' && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`status-badge ${u.status}`}>{u.status}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStatus(u._id)}
                      className={u.status === 'active' ? 'btn-danger' : 'btn-success'}
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Posts Table */}
      {tab === 'posts' && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td>{p.author?.name}</td>
                  <td>
                    <span className={`status-badge ${p.status}`}>{p.status}</span>
                  </td>
                  <td>
                    {p.status === 'published' && (
                      <button
                        className="btn-danger"
                        onClick={() => removePost(p._id)}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Messages Table */}
      {tab === 'messages' && (
        <div>
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg._id}>
                      <td>{msg.name}</td>
                      <td>{msg.email}</td>
                      <td className="message-preview">
                        {msg.message.length > 50 ? msg.message.substring(0, 50) + '…' : msg.message}
                      </td>
                      <td>{new Date(msg.createdAt).toLocaleString()}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-info"
                          onClick={() => openViewModal(msg)}
                        >
                          View
                        </button>
                        <button
                          className="btn-primary"
                          onClick={() => openReplyModal(msg)}
                        >
                          Reply
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => deleteMessage(msg._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View Message Modal */}
      {showViewModal && viewingMessage && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Message from {viewingMessage.name}</h3>
            <div className="view-message-details">
              <p><strong>Email:</strong> {viewingMessage.email}</p>
              <p><strong>Sent:</strong> {new Date(viewingMessage.createdAt).toLocaleString()}</p>
              <hr />
              <p><strong>Message:</strong></p>
              <div className="full-message">{viewingMessage.message}</div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowViewModal(false)}>Close</button>
              <button className="btn-primary" onClick={() => {
                setShowViewModal(false);
                openReplyModal(viewingMessage);
              }}>
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && replyingTo && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reply to {replyingTo.name}</h3>
            <div className="reply-original">
              <strong>Original message:</strong>
              <div className="original-message-preview">{replyingTo.message}</div>
            </div>
            <textarea
              rows="5"
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setShowReplyModal(false)} disabled={sending}>
                Cancel
              </button>
              <button onClick={sendReply} disabled={sending}>
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;