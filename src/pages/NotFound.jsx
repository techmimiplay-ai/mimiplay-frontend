import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/shared';
import { Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gradient mb-4">404</h1>
        <h2 className="text-4xl font-bold text-text mb-4">Page Not Found</h2>
        <p className="text-xl text-text/70 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Button
          variant="primary"
          size="lg"
          icon={Home}
          onClick={() => navigate('/login')}
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;