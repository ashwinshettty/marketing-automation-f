import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../utils/authStorage';

const Logout = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthSession();
    onLogout?.();
    navigate('/login', { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-brand-yellow"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow/20 text-brand-yellow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </span>
      Logout
    </button>
  );
};

export default Logout;
