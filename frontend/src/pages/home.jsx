import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Trophy, 
  Users, 
  Zap, 
  Shield, 
  BookOpen, 
  Vote, 
  ShoppingBag,
  ChevronRight,
  Play,
  Star,
  Coins,
  Award,
  TrendingUp
} from 'lucide-react';
import Navbar from '../components/Navbar';

const Homepage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Soulbound Wallet",
      description: "Your identity-linked crypto wallet with $CAMP tokens",
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: <Vote className="w-8 h-8" />,
      title: "DAO Voting",
      description: "Anonymous, tamper-proof voting with reputation weighting",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "NFT Achievements",
      description: "Collect POAPs for events, competitions, and milestones",
      color: "from-purple-600 to-pink-500"
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "P2P Marketplace",
      description: "Trade books, gadgets, and services with escrow protection",
      color: "from-cyan-500 to-blue-600"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Students", icon: <Users className="w-6 h-6" /> },
    { number: "50M+", label: "$CAMP Tokens", icon: <Coins className="w-6 h-6" /> },
    { number: "500+", label: "Events Hosted", icon: <Award className="w-6 h-6" /> },
    { number: "95%", label: "Attendance Rate", icon: <TrendingUp className="w-6 h-6" /> }
  ];

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950/50 to-blue-950/50" />
        
        {/* Floating orbs */}
        <div 
          className="absolute w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transform: `translate(${scrollY * 0.5}px, ${scrollY * 0.3}px)`
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-600/8 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-cyan-600/10 rounded-full blur-xl animate-pulse" />
        
        {/* Subtle grid pattern */}
        {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366f1" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" /> */}
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo Animation */}
          <div className="mb-8 relative">
            <div className="inline-flex items-center space-x-3 p-4 bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center animate-spin-slow shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                CampusXChain
              </span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Campus Life
            </span>
            <br />
            <span className="text-white">Reimagined</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
            The first blockchain-powered campus ecosystem. Pay fees, earn tokens, collect NFTs, 
            and build your on-chain reputation—all in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-2xl hover:shadow-purple-500/25">
              <span className="flex items-center space-x-2">
                <span>Start Your Journey</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button className="group px-8 py-4 bg-gray-800/80 backdrop-blur-sm rounded-full text-lg font-semibold hover:bg-gray-700/80 transition-all duration-300 border border-gray-600/50">
              <span className="flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="p-6 bg-gray-900/60 backdrop-blur-lg rounded-xl border border-gray-700/50 hover:bg-gray-800/60 transition-all duration-300 hover:scale-105 shadow-xl"
              >
                <div className="flex items-center justify-center mb-2 text-purple-400">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need for a seamless campus experience, powered by blockchain technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-700/50 hover:bg-gray-800/60 transition-all duration-500 hover:scale-105 cursor-pointer shadow-xl hover:shadow-2xl"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-500 group-hover:text-gray-400 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 bg-gray-900/70 backdrop-blur-lg rounded-3xl border border-gray-700/50 shadow-2xl">
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/60 rounded-full text-sm text-purple-300 border border-gray-600/50">
                <Star className="w-4 h-4" />
                <span>Coming Soon</span>
              </div>
            </div>
            
            <h3 className="text-3xl font-bold mb-4 text-white">
              Ready to Transform Your Campus Experience?
            </h3>
            <p className="text-gray-400 mb-8 text-lg">
              Join the revolution and be among the first students to experience the future of campus life.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg">
                Get Early Access
              </button>
              <button className="px-8 py-4 bg-gray-800/60 backdrop-blur-sm rounded-full text-lg font-semibold hover:bg-gray-700/60 transition-all duration-300 border border-gray-600/50">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transform transition-all duration-300 animate-bounce">
          <Wallet className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
    </>
  );
};

export default Homepage;