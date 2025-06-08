import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './../AuthContext';
import './styles/Auth.css';
import { FcGoogle } from 'react-icons/fc';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await register(username, email, password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setIsSubmitting(false);
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'https://recipefinder-af8u.onrender.com/auth/google';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
            <small>Minimum 6 characters</small>
          </div>
          
          <button type="submit" disabled={isSubmitting} className="auth-button">
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="google-auth-button"
        >
          <FcGoogle size={20} />
          <span>Continue with Google</span>
        </button>
        
        <div className="auth-footer">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
