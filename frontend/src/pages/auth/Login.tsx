import { useState, ChangeEvent, FormEvent } from 'react';
import Navbar from '../../components/navbar/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { apiPost, setToken } from '../../api/client';
import tractorImg from '../../assets/images/tractor.png';
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

      // Backend wraps response in data.data
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
    <>
      <Navbar />
      <div className="auth-page">
        {/* Noise overlay — same as the rest of the platform */}
        <div className="auth-noise" aria-hidden="true" />

        {/* ── Centered Card ── */}
        <div className="auth-card">

          {/* Left: Form Panel */}
          <div className="auth-form-panel">
            <div className="auth-form-container">

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
                    Forgot your password?
                  </Link>
                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? <div className="spinner" /> : 'Login'}
                  </button>
                </div>
              </form>

            </div>
          </div>

          {/* Right: Visual Panel */}
          <div className="auth-visual-panel">
            <div className="auth-visual-blob" />
            <img
              src={tractorImg}
              alt="KainaFresh Delivery Tractor"
              className="auth-visual-image"
            />
          </div>

        </div>
      </div>
    </>
  );
}

export default Login;
