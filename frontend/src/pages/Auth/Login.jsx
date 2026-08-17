import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { apiPost, setToken } from '../../api/client';
import './Auth.css';

/**
 * Login Page
 * Calls POST /api/login.
 * On success: stores token and redirects to home (or /admin if admin role).
 */
function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.email.trim()) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.';
    if (!form.password) return 'Password is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setIsLoading(true);
    setError('');

    try {
      const data = await apiPost('/api/login', {
        email: form.email.trim(),
        password: form.password,
      });

      setToken(data.token);

      // Redirect based on role
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left brand panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <Link to="/" className="auth-logo">
            Kaina<span>Fresh</span>
          </Link>
          <h2 className="auth-brand-heading">
            Fresh from the farm,<br />straight to you.
          </h2>
          <p className="auth-brand-sub">
            Join thousands of customers who trust KainaFresh for fresh, locally-sourced produce delivered to their door.
          </p>
          <div className="auth-brand-stats">
            <div className="auth-stat">
              <strong>350+</strong>
              <span>Happy customers</span>
            </div>
            <div className="auth-stat">
              <strong>100%</strong>
              <span>Organic produce</span>
            </div>
          </div>
        </div>
        {/* Decorative shapes */}
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your KainaFresh account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Global error */}
            {error && (
              <div className="auth-error-banner" role="alert">
                <span className="auth-error-icon">⚠</span>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={error && !form.email ? 'input-error' : ''}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="input-with-icon">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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

            {/* Submit */}
            <button
              type="submit"
              className={`btn btn-primary auth-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup">Create one for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
