import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Zap, 
  User, 
  Bell, 
  Settings,
  Wallet,
  Trophy,
  Vote,
  BookOpen,
  ShoppingBag,
  ChevronDown,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      name: 'Features',
      dropdown: [
        { name: 'Soulbound Wallet', icon: <Wallet className="w-4 h-4" />, href: '#wallet' },
        { name: 'DAO Voting', icon: <Vote className="w-4 h-4" />, href: '#voting' },
        { name: 'NFT Achievements', icon: <Trophy className="w-4 h-4" />, href: '#nft' },
        { name: 'P2P Marketplace', icon: <ShoppingBag className="w-4 h-4" />, href: '#marketplace' }
      ]
    },
    { name: 'Campus', to: '/camp', isLink: true },
    { name: 'Community', href: '#community' },
    { name: 'Docs', href: '#docs' }
  ];

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };
   
  if (!user || !userProfile) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gray-900/95 backdrop-blur-md border-b border-white/10 shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 group cursor-pointer flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CampusXChain
            </span>
          </div>

          {/* Spacer - This creates the extra space between left and right sections */}
          <div className="flex-1"></div>

          
          <div className="hidden md:flex items-center space-x-6">
            
            

            {/* Wallet Connection */}
            {walletConnected ? (
              <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-full border border-purple-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-300">Connected</span>
                <div className="text-purple-400">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setWalletConnected(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                Connect Wallet
              </button>
            )}

            {/* User Info Desktop */}
            <div className="flex items-center space-x-7">
              {/* User Details */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-300">{userProfile?.name || user.displayName}</p>
                <p className="text-xs text-gray-400">{userProfile?.email || user.email}</p>
              </div>

              {/* Profile Image */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-gray-300">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors duration-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="bg-gray-900/95 backdrop-blur-lg border-t border-white/10">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Nav Items */}
            {navItems.map((item, index) => (
              <div key={index}>
                {item.dropdown ? (
                  <div>
                    <button 
                      className="w-full flex items-center justify-between text-left text-gray-300 hover:text-white transition-colors duration-200 py-2"
                      onClick={() => toggleDropdown(index)}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === index ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {/* Mobile Dropdown */}
                    <div className={`ml-4 space-y-2 transition-all duration-300 ${
                      activeDropdown === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}>
                      {item.dropdown.map((dropItem, dropIndex) => (
                        <a
                          key={dropIndex}
                          href={dropItem.href}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                        >
                          <div className="text-purple-400">
                            {dropItem.icon}
                          </div>
                          <span className="text-gray-400">
                            {dropItem.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <a 
                    href={item.href}
                    className="block text-gray-300 hover:text-white transition-colors duration-200 py-2"
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}

            {/* Mobile Actions */}
            <div className="border-t border-white/10 pt-4 mt-4">
              {/* Mobile User Info */}
              <div className="flex items-center space-x-3 mb-4">
                {/* Profile Image */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-gray-300">
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
                
                {/* User Details */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-300">{userProfile?.name || user.displayName}</p>
                  <p className="text-xs text-gray-400">{userProfile?.email || user.email}</p>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Mobile Wallet */}
              {walletConnected ? (
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-300">Wallet Connected</span>
                  <Wallet className="w-4 h-4 text-purple-400 ml-auto" />
                </div>
              ) : (
                <button 
                  onClick={() => setWalletConnected(true)}
                  className="w-full p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-white font-medium transition-all duration-300 mb-4"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;