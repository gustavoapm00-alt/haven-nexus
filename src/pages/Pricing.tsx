import { Navigate } from 'react-router-dom';

// Legacy Pricing page redirects to marketplace bundles
const Pricing = () => {
  return <Navigate to="/bundles" replace />;
};

export default Pricing;
