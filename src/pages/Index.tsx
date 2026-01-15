import { Navigate } from 'react-router-dom';

// Legacy Index page now redirects to marketplace home
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
