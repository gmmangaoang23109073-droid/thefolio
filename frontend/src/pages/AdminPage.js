import { useState, useEffect } from 'react';
import API from '../api/axios';
import '../App.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);

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
      if (selectedConversation?._id === id) setShowConversationModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openConversation = (msg) => {
    setSelectedConversation(msg);
    setReplyText('');
    setShowConversationModal(true);
  };

  const sendReply = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }
    setSendingReply(true);
    try {
      await API.post(`/admin/messages/${selectedConversation._id}/reply`, { reply: replyText });
      // Update local messages list to show the reply
      setMessages(messages.map(m => m._id === selectedConversation._id
        ? { ...m, adminReply: replyText, repliedAt: new Date().toISOString() }
        : m));
      setReplyText('');
      // Update selected conversation
      setSelectedConversation({
        ...selectedConversation,
        adminReply: replyText,
        repliedAt: new Date().toISOString(),
      });
      alert('Reply sent successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="stats">
          <div className="stat-card">Members: {users.length}</div>
          <div className="stat-card">Posts: {posts.length}</div>
          <div className="stat-card">Messages: {messages.length}</div>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>Posts</button>
        <button className={tab === 'messages' ? 'active' : ''} onClick={() => setTab('messages')}>Messages</button>
      </div>

      {tab === 'users' && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`status-badge ${u.status}`}>{u.status}</span></td>
                  <td><button className="btn-toggle" onClick={() => toggleStatus(u._id)}>{u.status === 'active' ? 'Deactivate' : 'Activate'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'posts' && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Author</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {posts.map(p => (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td>{p.author?.name}</td>
                  <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                  <td>{p.status === 'published' && <button className="btn-danger" onClick={() => removePost(p._id)}>Remove</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'messages' && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg._id}>
                  <td>{msg.name}</td>
                  <td>{msg.email}</td>
                  <td className="message-preview">{msg.message.length > 50 ? msg.message.substring(0, 50) + '…' : msg.message}</td>
                  <td>{new Date(msg.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="btn-info" onClick={() => openConversation(msg)}>View Thread</button>
                    <button className="btn-danger" onClick={() => deleteMessage(msg._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Conversation Modal */}
      {showConversationModal && selectedConversation && (
        <div className="modal-overlay" onClick={() => setShowConversationModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Conversation with {selectedConversation.name}</h3>
            <div className="conversation-thread">
              <div className="user-message">
                <div className="message-header"><strong>User:</strong> <span>{new Date(selectedConversation.createdAt).toLocaleString()}</span></div>
                <div className="message-text">{selectedConversation.message}</div>
              </div>
              {selectedConversation.adminReply && (
                <div className="admin-message">
                  <div className="message-header"><strong>Admin reply:</strong> <span>{new Date(selectedConversation.repliedAt).toLocaleString()}</span></div>
                  <div className="message-text">{selectedConversation.adminReply}</div>
                </div>
              )}
            </div>
            <div className="reply-form">
              <textarea
                rows="3"
                placeholder="Write your reply..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowConversationModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={sendReply} disabled={sendingReply}>
                  {sendingReply ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;