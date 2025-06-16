import React, { useState, useEffect, createContext, useContext } from 'react';
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
  Copy,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  
  const { 
    walletAddress, 
    balance, 
    chainId, 
    isConnecting, 
    error, 
    isConnected, 
    connectWallet, 
    disconnectWallet,
    isMetaMaskInstalled
  } = useWallet();

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
    { name: 'Campus', href: '#campus' },
    { name: 'Community', href: '#community' },
    { name: 'Docs', href: '#docs' }
  ];

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getChainName = (chainId) => {
    const chains = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten',
      '0x4': 'Rinkeby',
      '0x5': 'Goerli',
      '0x89': 'Polygon',
      '0xa86a': 'Avalanche'
    };
    return chains[chainId] || 'Unknown Network';
  };

  const handleWalletConnect = async () => {
    if (!isMetaMaskInstalled()) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    await connectWallet();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gray-900/95 backdrop-blur-md border-b border-white/10 shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CampusXChain
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.dropdown ? (
                  <div>
                    <button 
                      className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors duration-200 py-2"
                      onMouseEnter={() => toggleDropdown(index)}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div 
                      className={`absolute top-full left-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl transition-all duration-300 ${
                        activeDropdown === index ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
                      }`}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="p-2">
                        {item.dropdown.map((dropItem, dropIndex) => (
                          <a
                            key={dropIndex}
                            href={dropItem.href}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 group"
                          >
                            <div className="text-purple-400 group-hover:text-purple-300">
                              {dropItem.icon}
                            </div>
                            <span className="text-gray-300 group-hover:text-white">
                              {dropItem.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <a 
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-purple-500 after:to-blue-500 hover:after:w-full after:transition-all after:duration-300"
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200 relative">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
            </button>

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="relative">
                <button 
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-full border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">{formatAddress(walletAddress)}</span>
                  <div className="text-purple-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                </button>

                {/* Wallet Dropdown */}
                {showWalletDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Wallet Info</h3>
                        <button
                          onClick={() => setShowWalletDropdown(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">Address:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white text-sm font-mono">{formatAddress(walletAddress)}</span>
                            <button
                              onClick={() => copyToClipboard(walletAddress)}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {balance && (
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-400 text-sm">Balance:</span>
                            <span className="text-white text-sm font-mono">{balance} ETH</span>
                          </div>
                        )}
                        
                        {chainId && (
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-400 text-sm">Network:</span>
                            <span className="text-white text-sm">{getChainName(chainId)}</span>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t border-white/10">
                          <button
                            onClick={() => {
                              window.open(`https://etherscan.io/address/${walletAddress}`, '_blank');
                            }}
                            className="w-full flex items-center justify-center space-x-2 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View on Etherscan</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              disconnectWallet();
                              setShowWalletDropdown(false);
                            }}
                            className="w-full flex items-center justify-center space-x-2 p-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Disconnect</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={handleWalletConnect}
                disabled={isConnecting}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                {isConnecting ? 'Connecting...' : isMetaMaskInstalled() ? 'Connect Wallet' : 'Install MetaMask'}
              </button>
            )}

            {/* Profile */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200">
              <User className="w-5 h-5" />
            </button>
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

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
            <div className="pt-4 border-t border-white/10 space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              </button>

              {isConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="text-gray-300 text-sm">Connected</div>
                      <div className="text-gray-400 text-xs font-mono">{formatAddress(walletAddress)}</div>
                    </div>
                    <Wallet className="w-4 h-4 text-purple-400" />
                  </div>
                  
                  <button 
                    onClick={disconnectWallet}
                    className="w-full p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleWalletConnect}
                  disabled={isConnecting}
                  className="w-full p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 rounded-lg text-white font-medium transition-all duration-300"
                >
                  {isConnecting ? 'Connecting...' : isMetaMaskInstalled() ? 'Connect Wallet' : 'Install MetaMask'}
                </button>
              )}

              <button className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;