import { Navigate } from 'react-router-dom';
import { getSessionEvaluation } from '../utils/authStorage';
import { resolveProtectedAccess } from '../utils/authSessionPolicy';

const ProtectedRoute = ({ children }) => {
  const access = resolveProtectedAccess(getSessionEvaluation());
  if (!access.allow) {
    return <Navigate to={access.redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
