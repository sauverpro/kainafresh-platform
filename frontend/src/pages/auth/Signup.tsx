/**
 * ============================================================================
 * KainaFresh Organic Platform — Progressive 3-Step User Registration Page
 * ============================================================================
 * 
 * Features:
 * 1. Multi-step progressive form flow (Step 1: Personal, Step 2: Contact, Step 3: Security).
 * 2. Real-time dynamic password strength evaluation engine (Weak, Fair, Good, Strong).
 * 3. Step-by-step field verification guards before advancing (`validateStep`).
 * 4. Automatic post-registration authentication and automatic login redirect.
 */

// Import React state hooks
import { useState } from 'react';

// Import TypeScript form event types
import type { ChangeEvent, FormEvent } from 'react';

// Import React Router navigation components
import { Link, useNavigate } from 'react-router-dom';

// Import Lucide vector icons for progressive step navigation and form inputs
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Phone, Lock, User, AtSign, Truck, Clock } from 'lucide-react';

// Import API client helpers for user registration and JWT token storage
import { apiPost, setToken } from '../../api/client';

// Import hook to dynamically update HTML title tag
import { usePageTitle } from '../../hooks/usePageTitle';

// Import tractor asset image
import tractorImg from '../../assets/images/tractor.png';

// Import Auth component stylesheet
import './Auth.css';

/**
 * Interface representing all registration form fields.
 */
interface FormState {
  full_name: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
}

/**
 * Interface representing per-field error messages.
 */
interface FieldErrors {
  full_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Interface definition for API Login response payload structure.
 */
interface LoginResponse {
  data: {
    token: string;
  };
}

/**
 * Signup Page Component.
 */
function Signup() {
  // Set SEO document page title
  usePageTitle('signup', 'Sign Up');

  // Imperative navigation hook
  const navigate = useNavigate();

  // Current active step index state (Step 1, 2, or 3)
  const [step, setStep] = useState<number>(1);

  // Registration form values state container
  const [form, setForm] = useState<FormState>({
    full_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });

  // Password visibility toggle state
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Confirm password visibility toggle state
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Field validation errors state dictionary
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Server error message state string
  const [serverError, setServerError] = useState<string>('');

  // Form submission loading spinner state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Evaluates password strength score (0 to 4).
   * Checks length, uppercase, numbers, and special characters.
   */
  const getPasswordStrength = (pw: string): number => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  // Strength score label mapping
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  // Strength score CSS class mapping
  const strengthClass = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];

  // Compute current password strength score
  const pwStrength = getPasswordStrength(form.password);

  // Form input field change handler
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear error message for current input
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');

    // Update state key matching input name attribute
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Per-step input validation rules.
   * Ensures user cannot advance to the next step without valid data.
   */
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

  // Advance to next step handler
  const goNext = () => {
    const errors = validateStep();
    if (Object.keys(errors).length > 0) return setFieldErrors(errors);
    setStep((s) => s + 1);
  };

  // Step back to previous step handler
  const goBack = () => {
    setFieldErrors({});
    setServerError('');
    setStep((s) => s - 1);
  };

  /**
   * Final multi-step form submission handler.
   * Registers account via POST /api/auth/register and automatically logs user in.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Prevent standard form submission reload
    e.preventDefault();

    // Verify step 3 inputs
    const errors = validateStep();
    if (Object.keys(errors).length > 0) return setFieldErrors(errors);

    setIsLoading(true);
    setServerError('');

    try {
      // 1. Submit user registration payload to backend
      await apiPost('/api/auth/register', {
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        password: form.password,
      });

      // 2. Automatically log user in after successful registration
      const loginData = await apiPost<LoginResponse>('/api/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });

      // Store JWT token string in browser localStorage
      const { token } = loginData.data;
      setToken(token);

      // Redirect user to home landing page
      navigate('/');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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

          <div className="auth-tabs">
            <Link to="/login" className="auth-tab">Login</Link>
            <Link to="/signup" className="auth-tab active">Sign up</Link>
          </div>

          {/* Progress Bar & Headers based on Step */}
          {step === 1 && (
            <>
              <div className="signup-progress">
                <div className="signup-progress-track">
                  <div className="signup-progress-fill" style={{ width: '33%' }} />
                </div>
                <span className="signup-progress-label">Step 1 of 3</span>
              </div>
              <div className="auth-header">
                <h1>Let's get started!</h1>
                <p>Fresh produce is waiting for you — tell us your name.</p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="signup-progress">
                <div className="signup-progress-track">
                  <div className="signup-progress-fill" style={{ width: '66%' }} />
                </div>
                <span className="signup-progress-label">Step 2 of 3</span>
              </div>
              <div className="auth-header">
                <h1>Almost there!</h1>
                <p>Great choice! Where should we send your order updates?</p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="signup-progress">
                <div className="signup-progress-track">
                  <div className="signup-progress-fill" style={{ width: '100%' }} />
                </div>
                <span className="signup-progress-label">Step 3 of 3</span>
              </div>
              <div className="auth-header">
                <h1>One last step!</h1>
                <p>Your first farm-fresh delivery is just around the corner!</p>
              </div>
            </>
          )}

          {/* Server error */}
          {serverError && (
            <div className="auth-error-banner" role="alert">
              <span className="auth-error-icon">⚠</span>
              {serverError}
            </div>
          )}

          {/* ── Step 1: Name & Username ── */}
          {step === 1 && (
            <div className="signup-step-fields">
              <div className="form-group">
                <div className="input-with-icon">
                  <User className="input-icon-left" size={18} />
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
                  <AtSign className="input-icon-left" size={18} />
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
                <button type="button" className="auth-submit-btn secondary" onClick={goNext}>
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Email & Phone ── */}
          {step === 2 && (
            <div className="signup-step-fields">
              <div className="form-group">
                <div className="input-with-icon">
                  <Mail className="input-icon-left" size={18} />
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
                  <Phone className="input-icon-left" size={18} />
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
                <button type="button" className="signup-back-step-btn" onClick={goBack} aria-label="Go Back">
                  <ArrowLeft size={20} />
                </button>
                <button type="button" className="auth-submit-btn secondary" onClick={goNext}>
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Password ── */}
          {step === 3 && (
            <form className="signup-step-fields" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <div className="input-with-icon">
                  <Lock className="input-icon-left" size={18} />
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
                  <Lock className="input-icon-left" size={18} />
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
                <button type="button" className="signup-back-step-btn" onClick={goBack} aria-label="Go Back">
                  <ArrowLeft size={20} />
                </button>
                <button type="submit" className="auth-submit-btn secondary" disabled={isLoading}>
                  {isLoading ? <div className="spinner" /> : 'Join KainaFresh'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* ── Right: Visual Panel ── */}
      <div className="auth-visual-panel signup-visual">
        <div className="auth-visual-blob" />
        
        {/* Floating Badges */}
        <div className="auth-badge badge-top-left">
          <Truck size={20} className="auth-badge-icon" />
          Fast Delivery
        </div>
        
        <div className="auth-badge badge-bottom-right">
          <Clock size={20} className="auth-badge-icon" />
          Fresh Daily
        </div>

        <img
          src={tractorImg}
          alt="KainaFresh Delivery Tractor"
          className="auth-visual-image"
        />
      </div>

    </div>
  );
}

export default Signup;
