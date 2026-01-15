import { Navigate } from 'react-router-dom';

// Legacy Capabilities page redirects to deployment overview
const Capabilities = () => {
  return <Navigate to="/deployment" replace />;
};

export default Capabilities;
