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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4">
      <div className="bg-gray-800 border border-purple-700 rounded-2xl shadow-2xl shadow-purple-500/20 p-8 w-full max-w-md backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
           CampusXChain
          </h1>
          {/* <p className="text-purple-200 mt-2">
            Paise Udao Majje Karooo 🥳🥳
          </p> */}
        </div>

        {/* Toggle Login/Signup */}
        <div className="flex rounded-xl bg-gray-700 border border-purple-600/30 p-1 mb-8">
          <button
            onClick={() => switchView('login')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentView === 'login' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20 transform scale-105' 
                : 'text-purple-200 hover:text-white hover:bg-gray-600/50'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => switchView('signup')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentView === 'signup' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20 transform scale-105' 
                : 'text-purple-200 hover:text-white hover:bg-gray-600/50'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Success/Error Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm border ${
            message.type === 'success' 
              ? 'bg-green-900/50 border-green-500/50 text-green-300 shadow-lg shadow-green-500/10' 
              : 'bg-red-900/50 border-red-500/50 text-red-300 shadow-lg shadow-red-500/10'
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
          <p className="text-xs text-purple-300">
            {currentView === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => switchView('signup')}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
                >
                  Sign up here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => switchView('login')}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
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