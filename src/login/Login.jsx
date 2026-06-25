import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithOtp, loginWithPassword, sendOtp } from '../api/authApi';
import { saveAuthSession } from '../utils/authStorage';
import AuthLayout, { AuthFooterLink } from './AuthLayout';

const LOGIN_MODES = {
  PASSWORD: 'password',
  OTP: 'otp',
};

const OTP_RESEND_SECONDS = 300;

const inputClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition focus:border-brand-navy';

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(LOGIN_MODES.PASSWORD);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [passwordForm, setPasswordForm] = useState({
    emailId: '',
    password: '',
  });

  const [otpForm, setOtpForm] = useState({
    phoneNo: '',
    otp: '',
  });

  useEffect(() => {
    if (resendTimer <= 0) return undefined;

    const intervalId = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [resendTimer]);

  const handleAuthSuccess = (data) => {
    saveAuthSession({
      token: data.token,
      id: data.user.id,
      role: data.user.role,
      username: data.user.username,
    });

    navigate('/', { replace: true });
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await loginWithPassword(passwordForm);
      handleAuthSuccess(data);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!otpForm.phoneNo.trim()) {
      setError('Please enter your phone number first');
      return;
    }

    setError('');
    setOtpMessage('');
    setIsSendingOtp(true);

    try {
      const data = await sendOtp({ phoneNo: otpForm.phoneNo.trim() });
      setOtpSent(true);
      setOtpMessage(data.message || 'OTP sent to your WhatsApp');
      setResendTimer(data.expiresIn || OTP_RESEND_SECONDS);
    } catch (sendError) {
      setError(sendError.message);
      setOtpSent(false);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpLogin = async (event) => {
    event.preventDefault();

    if (!otpSent) {
      setError('Please send OTP to your WhatsApp first');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await loginWithOtp({
        phoneNo: otpForm.phoneNo.trim(),
        otp: otpForm.otp.trim(),
      });
      handleAuthSuccess(data);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetOtpState = () => {
    setOtpSent(false);
    setOtpMessage('');
    setResendTimer(0);
    setOtpForm((prev) => ({ ...prev, otp: '' }));
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to AI Bot"
    >
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-brand-cream p-1">
        <button
          type="button"
          onClick={() => {
            setMode(LOGIN_MODES.PASSWORD);
            setError('');
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            mode === LOGIN_MODES.PASSWORD
              ? 'bg-brand-navy text-white shadow'
              : 'text-brand-muted hover:text-brand-navy'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(LOGIN_MODES.OTP);
            setError('');
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            mode === LOGIN_MODES.OTP
              ? 'bg-brand-navy text-white shadow'
              : 'text-brand-muted hover:text-brand-navy'
          }`}
        >
          OTP
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {otpMessage && mode === LOGIN_MODES.OTP && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {otpMessage}
        </div>
      )}

      {mode === LOGIN_MODES.PASSWORD ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label
              htmlFor="emailId"
              className="mb-1.5 block text-sm font-medium text-brand-navy"
            >
              Email
            </label>
            <input
              id="emailId"
              type="email"
              required
              value={passwordForm.emailId}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  emailId: event.target.value,
                }))
              }
              placeholder="you@example.com"
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-brand-navy"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={passwordForm.password}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              placeholder="Enter your password"
              className={inputClassName}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-navy-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Signing in...' : 'Login with Password'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpLogin} className="space-y-4">
          <div>
            <label
              htmlFor="phoneNo"
              className="mb-1.5 block text-sm font-medium text-brand-navy"
            >
              Phone Number
            </label>
            <input
              id="phoneNo"
              type="tel"
              required
              value={otpForm.phoneNo}
              onChange={(event) => {
                resetOtpState();
                setOtpForm((prev) => ({
                  ...prev,
                  phoneNo: event.target.value,
                }));
              }}
              placeholder="9876543210"
              className={inputClassName}
            />
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSendingOtp || resendTimer > 0}
            className="w-full rounded-xl border border-brand-navy bg-white px-4 py-2.5 text-sm font-medium text-brand-navy transition hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSendingOtp
              ? 'Sending OTP...'
              : resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : 'Send OTP on WhatsApp'}
          </button>

          <div>
            <label
              htmlFor="otp"
              className="mb-1.5 block text-sm font-medium text-brand-navy"
            >
              OTP
            </label>
            <input
              id="otp"
              type="text"
              required
              inputMode="numeric"
              maxLength={6}
              value={otpForm.otp}
              onChange={(event) =>
                setOtpForm((prev) => ({
                  ...prev,
                  otp: event.target.value.replace(/\D/g, ''),
                }))
              }
              placeholder="Enter 6-digit OTP"
              className={inputClassName}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !otpSent}
            className="w-full rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-navy-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
      )}

      <AuthFooterLink
        text="Don't have an account?"
        linkText="Create account"
        to="/create-account"
      />
    </AuthLayout>
  );
};

export default Login;
