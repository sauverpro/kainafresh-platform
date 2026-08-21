import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Navbar from '../../components/navbar/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { apiPost, setToken } from '../../api/client';
import { usePageTitle } from '../../hooks/usePageTitle';
import tractorImg from '../../assets/images/tractor.png';
import './Auth.css';

/**
 * Signup Page — Progressive Multi-Step Form
 * Step 1: Name & Username
 * Step 2: Email & Phone
 * Step 3: Password
 * Backend: POST /api/auth/register requires: username, email, password, phone_number, full_name
 */
interface FormState {
  full_name: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  full_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  confirmPassword?: string;
}

interface LoginResponse {
  data: {
    token: string;
  };
}
function Signup() {
  usePageTitle('signup', 'Sign Up');
 const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);

  const [form, setForm] = useState<FormState>({
    full_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Password strength checking engine
  const getPasswordStrength = (pw: string): number => {
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Per-step structural verification
  const validateStep = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (step === 1) {
      if (!form.full_name.trim()) errors.full_name = 'Full name is required.';
      if (!form.username.trim()) errors.username = 'Username is required.';
      else if (form.username.includes(' ')) errors.username = 'No spaces allowed.';
    }
    if (step === 2) {
      if (!form.email.trim()) errors.email = 'Email is required.';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email address.';
      if (!form.phone_number.trim()) errors.phone_number = 'Phone number is required.';
    }
    if (step === 3) {
      if (!form.password) errors.password = 'Password is required.';
      else if (form.password.length < 8) errors.password = 'At least 8 characters required.';
      if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
      else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    }
    return errors;
  };

  const goNext = () => {
    const errors = validateStep();
    if (Object.keys(errors).length > 0) return setFieldErrors(errors);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setFieldErrors({});
    setServerError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validateStep();
    if (Object.keys(errors).length > 0) return setFieldErrors(errors);

    setIsLoading(true);
    setServerError('');

    try {
      // 1. Submit Registration
      await apiPost('/api/auth/register', {
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        password: form.password,
      });

      // 2. Perform Automatic Authentication Link
      const loginData = await apiPost<LoginResponse>('/api/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });

      const { token } = loginData.data;
      setToken(token);
      navigate('/');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-noise" aria-hidden="true" />

        <div className="auth-card">

          {/* Left: Progressive Form Panel */}
          <div className="auth-form-panel">
            <div className="auth-form-container">

              {/* Tabs */}
              <div className="auth-tabs">
                <Link to="/login" className="auth-tab">Login</Link>
                <Link to="/signup" className="auth-tab active">Sign up</Link>
              </div>

              {/* Progress Bar & Headers based on Step */}
              {step === 1 && (
                <>
                  <div className="signup-progress">
                    <div className="signup-progress-track">
                      <div className="signup-progress-fill" style={{ width: '20%' }} />
                    </div>
                    <span className="signup-progress-label">20% complete</span>
                  </div>
                  <div className="signup-step-header">
                    <h2 className="signup-step-title">Let's get started!</h2>
                    <p className="signup-step-subtitle">Fresh produce is waiting for you — tell us your name.</p>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="signup-progress">
                    <div className="signup-progress-track">
                      <div className="signup-progress-fill" style={{ width: '60%' }} />
                    </div>
                    <span className="signup-progress-label">60% complete</span>
                  </div>
                  <div className="signup-step-header">
                    <h2 className="signup-step-title">Almost there!</h2>
                    <p className="signup-step-subtitle">Great choice! Where should we send your order updates?</p>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="signup-progress">
                    <div className="signup-progress-track">
                      <div className="signup-progress-fill" style={{ width: '90%' }} />
                    </div>
                    <span className="signup-progress-label">90% complete</span>
                  </div>
                  <div className="signup-step-header">
                    <h2 className="signup-step-title">One last step!</h2>
                    <p className="signup-step-subtitle">Your first farm-fresh delivery is just around the corner!</p>
                  </div>
                </>
              )}

              {/* Server error */}
              {serverError && (
                <div className="auth-error-banner" role="alert">
                  {serverError}
                </div>
              )}

              {/* ── Step 1: Name & Username ── */}
              {step === 1 && (
                <div className="signup-step-fields">
                  <div className="form-group">
                    <div className="input-with-icon">
                      <input
                        id="signup-name"
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        autoComplete="name"
                        autoFocus
                        className={fieldErrors.full_name ? 'input-error' : ''}
                      />
                    </div>
                    {fieldErrors.full_name && <span className="field-error">{fieldErrors.full_name}</span>}
                  </div>

                  <div className="form-group">
                    <div className="input-with-icon">
                      <input
                        id="signup-username"
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        autoComplete="username"
                        className={fieldErrors.username ? 'input-error' : ''}
                      />
                    </div>
                    {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
                  </div>

                  <div className="signup-step-nav">
                    <span />
                    <button type="button" className="auth-submit-btn" onClick={goNext}>
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Email & Phone ── */}
              {step === 2 && (
                <div className="signup-step-fields">
                  <div className="form-group">
                    <div className="input-with-icon">
                      <input
                        id="signup-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email address"
                        autoComplete="email"
                        autoFocus
                        className={fieldErrors.email ? 'input-error' : ''}
                      />
                    </div>
                    {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <div className="input-with-icon">
                      <input
                        id="signup-phone"
                        type="tel"
                        name="phone_number"
                        value={form.phone_number}
                        onChange={handleChange}
                        placeholder="Phone number"
                        autoComplete="tel"
                        className={fieldErrors.phone_number ? 'input-error' : ''}
                      />
                    </div>
                    {fieldErrors.phone_number && <span className="field-error">{fieldErrors.phone_number}</span>}
                  </div>

                  <div className="signup-step-nav">
                    <button type="button" className="signup-back-btn" onClick={goBack}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="button" className="auth-submit-btn" onClick={goNext}>
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Password ── */}
              {step === 3 && (
                <form className="signup-step-fields" onSubmit={handleSubmit} noValidate>
                  <div className="form-group">
                    <div className="input-with-icon">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        autoFocus
                        className={fieldErrors.password ? 'input-error' : ''}
                      />
                      <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {form.password && (
                      <div className="password-strength">
                        <div className={`strength-bar ${strengthClass[pwStrength]}`}>
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`strength-segment ${i <= pwStrength ? 'filled' : ''}`} />
                          ))}
                        </div>
                        <span className={`strength-label ${strengthClass[pwStrength]}`}>
                          {strengthLabel[pwStrength]}
                        </span>
                      </div>
                    )}
                    {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                  </div>

                  <div className="form-group">
                    <div className="input-with-icon">
                      <input
                        id="signup-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        className={fieldErrors.confirmPassword ? 'input-error' : ''}
                      />
                      <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
                  </div>

                  <div className="signup-step-nav">
                    <button type="button" className="signup-back-btn" onClick={goBack}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                      {isLoading ? <div className="spinner" /> : 'Join KainaFresh'}
                    </button>
                  </div>
                </form>
              )}

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

export default Signup;
