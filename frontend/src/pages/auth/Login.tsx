/**
 * ============================================================================
 * KainaFresh Organic Platform — User & Admin Authentication Login Page
 * ============================================================================
 * 
 * Features:
 * 1. Split-screen brand layout with embedded vector icons.
 * 2. Client-side email pattern & password validation.
 * 3. JWT authentication token storage via setToken() helper.
 * 4. Automatic role-based navigation (/admin for admins, / for customers).
 */

// Import React hooks for managing form state
import { useState } from 'react';

// Import TypeScript form event types
import type { ChangeEvent, FormEvent } from 'react';

// Import React Router components for navigation and links
import { Link, useNavigate } from 'react-router-dom';

// Import Lucide vector icons for UI form inputs and badges
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Leaf, ShieldCheck } from 'lucide-react';

// Import API client helpers for authentication
import { apiPost, setToken, setCurrentUser } from '../../api/client';

// Import hook to dynamically update HTML document title
import { usePageTitle } from '../../hooks/usePageTitle';

// Import background image asset
import heroFarmersImg from '../../assets/images/hero-farmers.png';

// Import Auth component styling
import './Auth.css';

/**
 * Interface definition for API Login response payload structure.
 */
interface LoginApiResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      role: 'admin' | 'sales_manager' | 'customer';
    };
  };
}

/**
 * Login Page Component.
 */
function Login() {
  // Update document title for SEO
  usePageTitle('login', 'Login');

  // Imperative router navigation instance
  const navigate = useNavigate();

  // Form input field values state
  const [form, setForm] = useState({ email: '', password: '' });

  // Password visibility toggle state
  const [showPassword, setShowPassword] = useState(false);

  // Form validation error message state
  const [error, setError] = useState('');

  // Async API submission loading spinner state
  const [isLoading, setIsLoading] = useState(false);

  // Handle text input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Clear error on user typing
    setError('');

    // Update form field state key matching input name attribute
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Client-side form input validation rules
  const validate = () => {
    if (!form.email.trim()) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.';
    if (!form.password) return 'Password is required.';
    return null;
  };

  // Form submission submit handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Prevent default HTML form reload
    e.preventDefault();

    // Execute validation check
    const validationError = validate();
    if (validationError) return setError(validationError);

    // Trigger loading spinner
    setIsLoading(true);
    setError('');

    try {
      // Execute POST request to backend authentication endpoint
      const data = await apiPost<LoginApiResponse>('/api/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });

      // Extract JWT token and user profile
      const { token, user } = data.data;

      // Store JWT token string in browser localStorage
      setToken(token);

      // Persist the signed-in user's profile for use across the app
      // (e.g. pre-filling checkout with the user's account details).
      if (user) setCurrentUser(user);

      // Route admin users to the Dashboard, and customers to Home page
      if (user?.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      // Handle authentication error responses
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      // Complete loading state
      setIsLoading(false);
    }
  };

  return (
    // Split-screen auth container
    <div className="auth-page">
      
      {/* ── Left Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          
          {/* Back to Home Link */}
          <Link to="/" className="auth-back-btn">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          {/* Heading */}
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Log in to access your farm-fresh deliveries and manage your orders.</p>
          </div>

          {/* Auth Tab Navigation */}
          <div className="auth-tabs">
            <Link to="/login" className="auth-tab active">Login</Link>
            <Link to="/signup" className="auth-tab">Sign up</Link>
          </div>

          {/* Form Element */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            
            {/* Error Notification Banner */}
            {error && (
              <div className="auth-error-banner" role="alert">
                <span className="auth-error-icon">⚠</span>
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="login-email">Email address</label>
              <div className="input-with-icon">
                <Mail className="input-icon-left" size={18} />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  autoComplete="email"
                  className={error && !form.email ? 'input-error' : ''}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon-left" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Actions Row */}
            <div className="auth-actions-row">
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? <div className="spinner" /> : 'Sign In'}
            </button>
          </form>

        </div>
      </div>

      {/* ── Right Visual Panel ── */}
      <div className="auth-visual-panel">
        <div className="auth-visual-blob" />
        
        {/* Floating Badges */}
        <div className="auth-badge badge-top-left">
          <Leaf size={20} className="auth-badge-icon" />
          100% Organic
        </div>
        
        <div className="auth-badge badge-bottom-right">
          <ShieldCheck size={20} className="auth-badge-icon" />
          Farm to Door
        </div>

        <img
          src={heroFarmersImg}
          alt="KainaFresh Farmers"
          className="auth-visual-image"
        />
      </div>

    </div>
  );
}

// Export Login page component
export default Login;
