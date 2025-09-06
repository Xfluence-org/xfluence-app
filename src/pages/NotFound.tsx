
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleReturnHome = () => {
    // Check if user is authenticated by looking at localStorage
    const storedAuth = localStorage.getItem('auth_state');
    
    if (storedAuth) {
      try {
        const { profile } = JSON.parse(storedAuth);
        if (profile?.user_type === 'Influencer') {
          navigate('/dashboard');
        } else {
          navigate('/brand-dashboard');
        }
      } catch (error) {
        navigate('/auth');
      }
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <button 
          onClick={handleReturnHome}
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
