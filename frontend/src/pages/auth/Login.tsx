import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Leaf, ShieldCheck } from 'lucide-react';
import { apiPost, setToken } from '../../api/client';
import { usePageTitle } from '../../hooks/usePageTitle';
import heroFarmersImg from '../../assets/images/hero-farmers.png';
import './Auth.css';

/**
 * Login Page
 * Split-screen design with embedded icons and heavy branding.
 */
function Login() {
  usePageTitle('login', 'Login');
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.email.trim()) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.';
    if (!form.password) return 'Password is required.';
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setIsLoading(true);
    setError('');

    try {
      const data = await apiPost('/api/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });

      const { token, user } = data.data;
      setToken(token);

      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left: Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          
          <Link to="/" className="auth-back-btn">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Log in to access your farm-fresh deliveries and manage your orders.</p>
          </div>

          <div className="auth-tabs">
            <Link to="/login" className="auth-tab active">Login</Link>
            <Link to="/signup" className="auth-tab">Sign up</Link>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="auth-error-banner" role="alert">
                <span className="auth-error-icon">⚠</span>
                {error}
              </div>
            )}

            {/* Email */}
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

            {/* Password */}
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

      {/* ── Right: Visual Panel ── */}
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

export default Login;
