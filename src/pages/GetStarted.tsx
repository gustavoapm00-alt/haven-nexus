import { Navigate } from 'react-router-dom';

// Legacy GetStarted page redirects to marketplace
const GetStarted = () => {
  return <Navigate to="/packs" replace />;
};

export default GetStarted;
