import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { apiPost, setToken } from '../../api/client';
import './Auth.css';

/**
 * Signup Page
 * Calls POST /api/register.
 * On success: stores token and redirects to home.
 */
function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength: 0-4
  const getPasswordStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthClass = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];
  const pwStrength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email address.';
    if (!form.password) errors.password = 'Password is required.';
    else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) return setFieldErrors(errors);

    setIsLoading(true);
    setServerError('');

    try {
      // Register the user
      await apiPost('/api/register', {
        email: form.email.trim(),
        password: form.password,
      });

      // Auto-login after successful registration
      const loginData = await apiPost('/api/login', {
        email: form.email.trim(),
        password: form.password,
      });

      setToken(loginData.token);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
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
            Your farm-fresh journey starts here.
          </h2>
          <p className="auth-brand-sub">
            Create a free account and start ordering the freshest produce directly from KainaFresh farm.
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
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Create your account</h1>
            <p>Join KainaFresh — it's free</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Server error */}
            {serverError && (
              <div className="auth-error-banner" role="alert">
                <span className="auth-error-icon">⚠</span>
                {serverError}
              </div>
            )}

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
                autoComplete="name"
                className={fieldErrors.fullName ? 'input-error' : ''}
              />
              {fieldErrors.fullName && (
                <span className="field-error">{fieldErrors.fullName}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={fieldErrors.email ? 'input-error' : ''}
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password + strength */}
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="input-with-icon">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={fieldErrors.password ? 'input-error' : ''}
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
              {form.password && (
                <div className="password-strength">
                  <div className={`strength-bar ${strengthClass[pwStrength]}`}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`strength-segment ${i <= pwStrength ? 'filled' : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`strength-label ${strengthClass[pwStrength]}`}>
                    {strengthLabel[pwStrength]}
                  </span>
                </div>
              )}
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="signup-confirm">Confirm password</label>
              <div className="input-with-icon">
                <input
                  id="signup-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={fieldErrors.confirmPassword ? 'input-error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className="field-error">{fieldErrors.confirmPassword}</span>
              )}
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
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
