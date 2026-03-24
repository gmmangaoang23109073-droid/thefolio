// frontend/src/App.js
import { BrowserRouter, Routes, Route, useLocation, Navigate, NavLink } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import SplashPage from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";
import EditPostPage from "./pages/EditPostPage";
import CreatePostPage from "./pages/CreatePostPage";
import AdminPage from "./pages/AdminPage";

// Route guard for Contact – only guests and regular users allowed
const ContactRoute = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Navigate to="/home" replace />;
  }
  return <ContactPage />;
};

function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const hideHeaderFooter =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className={darkMode ? "dark" : ""}>
      {!hideHeaderFooter && (
        <header className="header">
          <h1 className="site-title">The Chic Journal</h1>
          <nav className="nav-bar">
            <ul>
              <li>
                <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
                  About
                </NavLink>
              </li>

              {/* Contact link: hidden for admin users */}
              {(!user || user.role !== 'admin') && (
                <li>
                  <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
                    Contact
                  </NavLink>
                </li>
              )}

              {user ? (
                <>
                  <li>
                    <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                      Profile
                    </NavLink>
                  </li>
                  {user.role === 'admin' && (
                    <li>
                      <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
                        Admin
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <NavLink to="/create-post" className={({ isActive }) => (isActive ? "active" : "")}>
                      Write Post
                    </NavLink>
                  </li>
                  <li className="user-info">
                    <span className="user-greeting">Hi, {user.name}!</span>
                    <button onClick={handleLogout} className="logout-btn-nav">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
                      Register
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                      Login
                    </NavLink>
                  </li>
                </>
              )}

              <li>
                <button 
                  className={`glow-btn ${darkMode ? 'dark' : 'light'}`}
                  onClick={toggleDarkMode}
                  aria-label="Toggle dark mode"
                >
                  <span className="glow-text">{darkMode ? '☾' : '☀︎'}</span>
                </button>
              </li>
            </ul>
          </nav>
        </header>
      )}

      <main style={{ minHeight: "100vh" }}>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/home" /> : <RegisterPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Protected contact route */}
          <Route path="/contact" element={<ContactRoute />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/posts/:id" element={<PostPage />} />
          <Route path="/edit-post/:id" element={user ? <EditPostPage /> : <Navigate to="/login" />} />
          <Route path="/create-post" element={user ? <CreatePostPage /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/home" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {!hideHeaderFooter && (
        <footer className="footer">
          <p>Contact: urblinkPranpriya@gmail.com</p>
          <p>&copy; 2026 The Chic Journal</p>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;