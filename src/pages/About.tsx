import { Navigate } from 'react-router-dom';

// Legacy About page redirects to marketplace home
const About = () => {
  return <Navigate to="/" replace />;
};

export default About;
