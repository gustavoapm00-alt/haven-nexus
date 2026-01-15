import { Navigate } from 'react-router-dom';

// Legacy GetStarted page redirects to marketplace
const GetStarted = () => {
  return <Navigate to="/agents" replace />;
};

export default GetStarted;
