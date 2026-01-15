import { Navigate } from 'react-router-dom';

// Legacy Reliability page redirects to security practices
const Reliability = () => {
  return <Navigate to="/security" replace />;
};

export default Reliability;
