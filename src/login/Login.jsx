import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { loginWithOtp, sendOtp } from '../api/authApi';
import { isAuthenticated, saveAuthSession } from '../utils/authStorage';
import AuthLayout from './AuthLayout';

const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 300;

const formatTimer = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.82c0 1.96.52 3.8 1.44 5.4L2 22l4.96-1.52a10.05 10.05 0 0 0 5.08 1.36h.01c5.46 0 9.89-4.4 9.89-9.82S17.5 2 12.04 2zm5.75 14.05c-.24.68-1.4 1.25-1.93 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.26-4.79-4.2-4.93-4.4-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.36.26-.28.57-.35.76-.35h.55c.17 0 .4-.07.63.48.24.58.81 2 .88 2.14.07.14.12.31.02.5-.1.19-.14.31-.28.48-.14.17-.3.37-.42.5-.14.14-.28.29-.12.56.16.28.71 1.17 1.53 1.9 1.05.93 1.93 1.22 2.21 1.36.28.14.44.12.6-.07.17-.19.7-.81.89-1.09.19-.28.38-.23.63-.14.26.1 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36z" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const otpInputRef = useRef(null);
  const [step, setStep] = useState('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [phoneNo, setPhoneNo] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (resendTimer <= 0) return undefined;

    const intervalId = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [resendTimer]);

  useEffect(() => {
    if (step === 'otp') {
      otpInputRef.current?.focus();
    }
  }, [step]);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const digitsOnlyPhone = phoneNo.replace(/\D/g, '').slice(0, 10);
  const isPhoneValid = digitsOnlyPhone.length === 10;

  const handleAuthSuccess = (data) => {
    saveAuthSession({
      token: data.token,
      id: data.user.id,
      role: data.user.role,
      username: data.user.username,
    });

    navigate('/', { replace: true });
  };

  const handleSendOtp = async (event) => {
    event?.preventDefault();

    if (!isPhoneValid) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    setOtpMessage('');
    setIsSendingOtp(true);

    try {
      const data = await sendOtp({ phoneNo: digitsOnlyPhone });
      setStep('otp');
      setOtp('');
      setOtpMessage(data.message || 'OTP sent to your WhatsApp');
      setResendTimer(data.expiresIn || OTP_RESEND_SECONDS);
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async (code) => {
    const trimmedOtp = String(code || '').trim();

    if (trimmedOtp.length !== OTP_LENGTH) {
      setError('Enter the 6-digit OTP');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await loginWithOtp({
        phoneNo: digitsOnlyPhone,
        otp: trimmedOtp,
      });
      handleAuthSuccess(data);
    } catch (loginError) {
      setError(loginError.message);
      setOtp('');
      otpInputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (event) => {
    const nextOtp = event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(nextOtp);
    setError('');

    if (nextOtp.length === OTP_LENGTH) {
      verifyOtp(nextOtp);
    }
  };

  const handleOtpSubmit = (event) => {
    event.preventDefault();
    verifyOtp(otp);
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setOtp('');
    setError('');
    setOtpMessage('');
    setResendTimer(0);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with WhatsApp OTP using your registered mobile number."
    >
      <div className="mb-5 flex items-center gap-2">
        <span
          className={`h-1.5 flex-1 rounded-full transition ${
            step === 'phone' ? 'bg-brand-navy' : 'bg-brand-yellow'
          }`}
        />
        <span
          className={`h-1.5 flex-1 rounded-full transition ${
            step === 'otp' ? 'bg-brand-navy' : 'bg-brand-yellow/35'
          }`}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {otpMessage && step === 'otp' && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {otpMessage}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label
              htmlFor="phoneNo"
              className="mb-1.5 block text-sm font-medium text-brand-navy"
            >
              Mobile number
            </label>
            <div className="flex overflow-hidden rounded-xl border border-brand-yellow/50 bg-white transition focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy/15">
              <span className="flex items-center border-r border-brand-yellow/40 bg-brand-cream/70 px-3 text-sm font-medium text-brand-navy">
                +91
              </span>
              <input
                id="phoneNo"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                value={digitsOnlyPhone}
                onChange={(event) => {
                  setPhoneNo(event.target.value.replace(/\D/g, '').slice(0, 10));
                  setError('');
                }}
                placeholder="98XXXXXXXX"
                className="w-full bg-transparent px-4 py-3 text-sm tracking-wide text-brand-navy outline-none placeholder:text-brand-muted/50"
              />
            </div>
            <p className="mt-2 text-xs text-brand-muted">
              Use the number registered by your superadmin.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSendingOtp || !isPhoneValid}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-navy-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <WhatsAppIcon />
            {isSendingOtp ? 'Sending OTP...' : 'Send OTP on WhatsApp'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div className="rounded-xl bg-brand-cream/80 px-4 py-3">
            <p className="text-xs text-brand-muted">OTP sent to</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-brand-navy">+91 {digitsOnlyPhone}</p>
              <button
                type="button"
                onClick={handleChangeNumber}
                className="text-xs font-medium text-brand-navy underline-offset-2 hover:underline"
              >
                Change
              </button>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-brand-navy"
              >
                Enter 6-digit OTP
              </label>
              {resendTimer > 0 && (
                <span className="text-xs font-medium tabular-nums text-brand-muted">
                  Resend in {formatTimer(resendTimer)}
                </span>
              )}
            </div>
            <input
              ref={otpInputRef}
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={handleOtpChange}
              placeholder="••••••"
              className="w-full rounded-xl border border-brand-yellow/50 bg-white px-4 py-3 text-center text-2xl font-semibold tracking-[0.4em] text-brand-navy outline-none transition placeholder:tracking-[0.35em] placeholder:text-brand-muted/35 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15"
            />
            <p className="mt-2 text-xs text-brand-muted">
              Continues automatically once all 6 digits are entered.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== OTP_LENGTH}
            className="w-full rounded-xl bg-brand-navy px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-navy-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Verifying...' : 'Verify & continue'}
          </button>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSendingOtp || resendTimer > 0}
            className="w-full rounded-xl border border-brand-navy/20 bg-white px-4 py-2.5 text-sm font-medium text-brand-navy transition hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSendingOtp
              ? 'Resending...'
              : resendTimer > 0
                ? `Resend available in ${formatTimer(resendTimer)}`
                : 'Resend OTP'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default Login;
