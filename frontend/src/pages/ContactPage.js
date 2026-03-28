import React, { useState, useEffect } from "react";
import API from "../api/axios";
import "../App.css";

function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchUserMessages();
    }
  }, []);

  const fetchUserMessages = async () => {
    setMessagesLoading(true);
    try {
      const res = await API.get("/auth/messages");
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    let isValid = true;
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty";
      isValid = false;
    }
    setErrors(newErrors);
    if (isValid) {
      setLoading(true);
      setSubmitError("");
      try {
        await API.post("/contact", formData);
        setSubmitSuccess(true);
        setFormData({ name: "", email: "", message: "" });
        setErrors({});
        setTimeout(() => setSubmitSuccess(false), 3000);
        if (isLoggedIn) fetchUserMessages();
      } catch (err) {
        let errorMessage = "Failed to send message. ";
        if (err.response) {
          errorMessage += `Status ${err.response.status}. `;
          const details = err.response.data?.error || err.response.data?.message || JSON.stringify(err.response.data);
          errorMessage += details;
        } else if (err.request) {
          errorMessage += "No response from server. Check if backend is running.";
        } else {
          errorMessage += err.message;
        }
        setSubmitError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper to render replies
  const renderReplies = (msg) => {
    // If we have a replies array, render each
    if (msg.replies && msg.replies.length > 0) {
      return msg.replies.map((reply, idx) => (
        <div key={idx} className="admin-reply">
          <div className="reply-header">
            <strong>Admin reply:</strong>
            <span className="reply-date">
              {new Date(reply.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="reply-content">{reply.text}</div>
        </div>
      ));
    }
    // Backward compatibility: old single reply field
    if (msg.adminReply) {
      return (
        <div className="admin-reply">
          <div className="reply-header">
            <strong>Admin reply:</strong>
            <span className="reply-date">
              {msg.repliedAt ? new Date(msg.repliedAt).toLocaleString() : "Date unknown"}
            </span>
          </div>
          <div className="reply-content">{msg.adminReply}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="contact-page">
      {/* Contact Form */}
      <section className="contact-form-section">
        <h2 className="contact-title">Contact Me</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} />
          <span className="error">{errors.name}</span>

          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} />
          <span className="error">{errors.email}</span>

          <label htmlFor="message">Message:</label>
          <textarea id="message" name="message" placeholder="Your Message" value={formData.message} onChange={handleChange}></textarea>
          <span className="error">{errors.message}</span>

          {submitSuccess && <div className="success-message">Message sent successfully!</div>}
          {submitError && <div className="error-message">{submitError}</div>}

          <button type="submit" disabled={loading}>{loading ? "Sending..." : "Submit"}</button>
        </form>
      </section>

      {/* Inbox – only for logged-in users */}
      {isLoggedIn && (
        <section className="inbox-section">
          <button className="inbox-toggle-btn" onClick={() => setInboxOpen(!inboxOpen)}>
            {inboxOpen ? "Hide Inbox" : "Show Inbox"}
          </button>
          {inboxOpen && (
            <div className="inbox-container">
              <h3 className="inbox-title">My Messages</h3>
              {messagesLoading ? (
                <p>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p>You have no messages yet.</p>
              ) : (
                <div className="inbox-list">
                  {messages.map((msg) => (
                    <div key={msg._id} className="message-card">
                      <div className="message-header">
                        <span className="message-sender">You</span>
                        <span className="message-date">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="message-content">{msg.message}</div>
                      {renderReplies(msg)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Resources Table and Map */}
      <h3 className="section-title">Useful Resources</h3>
      <table className="resources-table">
        <thead>…
        </thead>
        <tbody>
          …
        </tbody>
       </table>

      <section className="map">
        <h2>Find Me</h2>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d417371.70963689976!2d128.7040100733377!3d35.188618370705385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3568eb6de823cd35%3A0x35d8cb74247108a7!2sBusan%2C%20South%20Korea!5e0!3m2!1sen!2sph!4v1768828262893!5m2!1sen!2sph" width="600" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" title="Busan Map"></iframe>
      </section>
    </div>
  );
}

export default ContactPage;