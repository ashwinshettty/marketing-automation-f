import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, loginWithPassword } from '../api/authApi';
import { saveAuthSession } from '../utils/authStorage';
import AuthLayout, { AuthFooterLink } from './AuthLayout';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'sales', label: 'Sales' },
];

const inputClassName =
  'w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition focus:border-brand-navy';

const CreateAccount = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    phoneNo: '',
    emailId: '',
    otp: '',
    password: '',
    role: 'admin',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        username: formData.username.trim(),
        phoneNo: formData.phoneNo.trim(),
        emailId: formData.emailId.trim(),
        password: formData.password,
        role: formData.role,
      };

      if (formData.otp.trim()) {
        payload.otp = formData.otp.trim();
      }

      await createUser(payload);

      const loginData = await loginWithPassword({
        emailId: formData.emailId.trim(),
        password: formData.password,
      });

      saveAuthSession({
        token: loginData.token,
        id: loginData.user.id,
        role: loginData.user.role,
        username: loginData.user.username,
      });

      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Set up your AI Bot workspace access"
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-sm font-medium text-brand-navy"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleChange}
            placeholder="John Doe"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="phoneNo"
            className="mb-1.5 block text-sm font-medium text-brand-navy"
          >
            Phone Number
          </label>
          <input
            id="phoneNo"
            name="phoneNo"
            type="tel"
            required
            value={formData.phoneNo}
            onChange={handleChange}
            placeholder="9876543210"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="emailId"
            className="mb-1.5 block text-sm font-medium text-brand-navy"
          >
            Email
          </label>
          <input
            id="emailId"
            name="emailId"
            type="email"
            required
            value={formData.emailId}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="otp"
            className="mb-1.5 block text-sm font-medium text-brand-navy"
          >
            OTP <span className="text-brand-muted">(optional)</span>
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            value={formData.otp}
            onChange={handleChange}
            placeholder="123456"
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
            name="password"
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="mb-1.5 block text-sm font-medium text-brand-navy"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            className={inputClassName}
          >
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-navy-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <AuthFooterLink
        text="Already have an account?"
        linkText="Login"
        to="/login"
      />
    </AuthLayout>
  );
};

export default CreateAccount;
