import { Link } from 'react-router-dom';

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="auth-signature-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative z-[1] w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/app-icon.png"
            alt="AI Bot"
            className="mb-4 h-20 w-20 rounded-full object-cover shadow-lg ring-4 ring-brand-yellow"
          />
          <h1 className="text-2xl font-semibold text-brand-navy">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>
          )}
        </div>

        <div className="rounded-2xl border border-brand-yellow/40 bg-white/95 p-6 shadow-xl backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export const AuthFooterLink = ({ text, linkText, to }) => (
  <p className="mt-6 text-center text-sm text-brand-muted">
    {text}{' '}
    <Link to={to} className="font-medium text-brand-navy hover:underline">
      {linkText}
    </Link>
  </p>
);

export default AuthLayout;
