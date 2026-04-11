// Use Render backend in production, localhost in development
export const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://thefolio-mpb8.onrender.com'   // <-- your Render backend URL
  : 'http://localhost:5000';