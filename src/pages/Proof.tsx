import { Navigate } from 'react-router-dom';

// Legacy Proof page redirects to deployment overview
const Proof = () => {
  return <Navigate to="/deployment" replace />;
};

export default Proof;
