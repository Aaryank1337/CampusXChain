import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Login from '../components/Login';
import Signup from '../components/Signup';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Auth = () => {
  const [currentView, setCurrentView] = useState('login');
  const [message, setMessage] = useState({ type: '', text: '' });

  const { user, userProfile, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userProfile?.role) {
      if (userProfile.role === 'admin') {
        navigate('/');
      } else {
        navigate('/');
      }
    }
  }, [user, userProfile, navigate]);

  const handleSuccess = (message) => {
    setMessage({ type: 'success', text: message });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleError = (message) => {
    setMessage({ type: 'error', text: message });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const switchView = (view) => {
    setCurrentView(view);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
           Hello Bachoooooo!!!!!!
          </h1>
          <p className="text-gray-600 mt-2">
            Paise Udao Majje Karooo 🥳🥳
          </p>
        </div>

        {/* Toggle Login/Signup */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-8">
          <button
            onClick={() => switchView('login')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentView === 'login' 
                ? 'bg-white text-blue-600 shadow-md transform scale-105' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => switchView('signup')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentView === 'signup' 
                ? 'bg-white text-blue-600 shadow-md transform scale-105' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Success/Error Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form Component */}
        <div className="transition-all duration-300 ease-in-out">
          {currentView === 'login' ? (
            <Login onSuccess={handleSuccess} onError={handleError} />
          ) : (
            <Signup onSuccess={handleSuccess} onError={handleError} />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            {currentView === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => switchView('signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => switchView('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Login here
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
