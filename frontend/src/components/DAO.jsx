import React, { useState, useEffect } from 'react';
import { Clock, Plus, X, Vote, TrendingUp, Users, Calendar, CheckCircle, XCircle, Sparkles, Eye } from 'lucide-react';
import { useWeb3 } from '../context/BlockchainContext';

const DAO = () => {
  const { 
    account, 
    campusDAO, 
    isInitialized, 
    createProposal, 
    vote, 
    getProposal 
  } = useWeb3();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProposal, setNewProposal] = useState({
    description: '',
    duration: 7 // days
  });
  const [votingStates, setVotingStates] = useState({});

  // Filter out proposals that ended more than 12 hours ago
  const filterRecentProposals = (proposalList) => {
    const now = Math.floor(Date.now() / 1000);
    const twelveHoursInSeconds = 12 * 60 * 60;
    
    return proposalList.filter(proposal => {
      if (proposal.active) return true; // Keep all active proposals
      
      // For ended proposals, only keep if they ended within the last 12 hours
      const timeSinceEnded = now - proposal.deadline;
      return timeSinceEnded <= twelveHoursInSeconds;
    });
  };

  // Fetch all proposals
  const fetchProposals = async () => {
    if (!campusDAO || !isInitialized) return;
    
    setLoading(true);
    try {
      const proposalCount = await campusDAO.proposalCount();
      const count = Number(proposalCount);
      const proposalList = [];

      for (let i = 1; i <= count; i++) {
        try {
          const proposalData = await getProposal(i);
          if (proposalData && proposalData[0]) { // Check if description exists
            const now = Math.floor(Date.now() / 1000);
            const deadline = Number(proposalData[3]);
            
            proposalList.push({
              id: i,
              description: proposalData[0],
              yesVotes: Number(proposalData[1]),
              noVotes: Number(proposalData[2]),
              deadline: deadline,
              active: proposalData[4] && now < deadline,
              timeLeft: deadline > now ? deadline - now : 0
            });
          }
        } catch (error) {
          console.error(`Error fetching proposal ${i}:`, error);
        }
      }
      
      // Filter and sort proposals
      const filteredProposals = filterRecentProposals(proposalList);
      setProposals(filteredProposals.reverse()); // Show newest first
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new proposal
  const handleCreateProposal = async (e) => {
    e.preventDefault();
    if (!newProposal.description.trim()) return;

    setLoading(true);
    try {
      const durationInSeconds = newProposal.duration * 24 * 60 * 60; // Convert days to seconds
      await createProposal(newProposal.description, durationInSeconds);
      
      setNewProposal({ description: '', duration: 7 });
      setShowCreateForm(false);
      await fetchProposals(); // Refresh proposals
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Failed to create proposal. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Vote on proposal
  const handleVote = async (proposalId, support) => {
    const voteKey = `${proposalId}-${support}`;
    setVotingStates(prev => ({ ...prev, [voteKey]: true }));

    try {
      await vote(proposalId, support);
      await fetchProposals(); // Refresh proposals
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. You may have already voted or lack CAMP tokens.');
    } finally {
      setVotingStates(prev => ({ ...prev, [voteKey]: false }));
    }
  };

  // Format time left
  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return 'Ended';
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  // Get vote percentage
  const getVotePercentage = (yes, no) => {
    const total = yes + no;
    if (total === 0) return 0;
    return Math.round((yes / total) * 100);
  };

  // Get proposal status color
  const getStatusColor = (proposal) => {
    if (!proposal.active) return 'from-slate-500 to-slate-600';
    const percentage = getVotePercentage(proposal.yesVotes, proposal.noVotes);
    if (percentage >= 60) return 'from-green-500 to-emerald-600';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-600';
  };

  // Load proposals on component mount
  useEffect(() => {
    if (isInitialized && account) {
      fetchProposals();
      // Set up interval to refresh proposals every 5 minutes
      const interval = setInterval(fetchProposals, 300000);
      return () => clearInterval(interval);
    }
  }, [isInitialized, account, campusDAO]);

  const ProposalCard = ({ proposal }) => {
    const votePercentage = getVotePercentage(proposal.yesVotes, proposal.noVotes);
    const totalVotes = proposal.yesVotes + proposal.noVotes;
    
    return (
      <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Sparkle effect */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r ${getStatusColor(proposal)} text-white backdrop-blur-sm`}>
                {proposal.active ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                Proposal #{proposal.id}
              </span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm ${
                proposal.active 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
              }`}>
                <Clock className="w-4 h-4 mr-1" />
                {proposal.active ? 'Active' : 'Ended'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-1">Time Remaining</p>
              <p className="text-lg font-semibold text-white">
                {formatTimeLeft(proposal.timeLeft)}
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300 mb-6">
            {proposal.description}
          </h3>

          {/* Vote Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Yes Votes</p>
                  <p className="text-2xl font-bold text-white">{proposal.yesVotes}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm font-medium">No Votes</p>
                  <p className="text-2xl font-bold text-white">{proposal.noVotes}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Approval Rate</p>
                  <p className="text-2xl font-bold text-white">{votePercentage}%</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Vote Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Approval Progress</span>
              <span>{totalVotes} total votes</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${proposal.yesVotes + proposal.noVotes === 0 
                    ? 0 
                    : (proposal.yesVotes / (proposal.yesVotes + proposal.noVotes)) * 100}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span className="font-medium">{votePercentage}% Yes</span>
              <span>100%</span>
            </div>
          </div>

          {/* Voting Buttons */}
          {proposal.active && (
            <div className="flex gap-3">
              <button
                onClick={() => handleVote(proposal.id, true)}
                disabled={votingStates[`${proposal.id}-true`]}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {votingStates[`${proposal.id}-true`] ? 'Voting...' : 'Vote Yes'}
              </button>
              <button
                onClick={() => handleVote(proposal.id, false)}
                disabled={votingStates[`${proposal.id}-false`]}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {votingStates[`${proposal.id}-false`] ? 'Voting...' : 'Vote No'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-slate-400">Please connect your wallet to access the Campus DAO</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Campus DAO
            </h1>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
          {/* <p className="text-xl text-slate-400 max-w-2xl">
            Participate in campus governance and decision making
          </p> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Proposals</p>
                <p className="text-2xl font-bold text-white">{proposals.filter(p => p.active).length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Proposals</p>
                <p className="text-2xl font-bold text-white">{proposals.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Vote className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Connected Wallet</p>
                <p className="text-lg font-bold text-white">{account?.slice(0, 6)}...{account?.slice(-4)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Create Proposal and Refresh Buttons */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all duration-300 flex items-center gap-3 font-semibold hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/25"
            disabled={loading}
          >
            {showCreateForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showCreateForm ? 'Cancel' : 'Create New Proposal'}
          </button>
          
          <button
            onClick={fetchProposals}
            disabled={loading}
            className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50"
          >
            {loading ? 'Loading...' : 'Refresh Proposals'}
          </button>
        </div>

        {/* Create Proposal Form */}
        {showCreateForm && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 border border-slate-700/50 shadow-2xl">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <Plus className="w-6 h-6 text-purple-400" />
              Create New Proposal
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Proposal Description
                </label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your proposal in detail..."
                  className="w-full p-4 bg-slate-800/50 border border-slate-600 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-400 transition-all duration-200"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Voting Duration (days)
                </label>
                <input
                  type="number"
                  value={newProposal.duration}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, duration: parseInt(e.target.value) || 7 }))}
                  min="1"
                  max="30"
                  className="w-full p-4 bg-slate-800/50 border border-slate-600 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-white transition-all duration-200"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateProposal}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? 'Creating...' : 'Submit Proposal'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Proposals Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-400" />
              Proposals ({proposals.length})
            </h2>
          </div>
          
          {loading && proposals.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400"></div>
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">Loading proposals...</h3>
              <p className="text-slate-500">Please wait while we fetch the latest proposals.</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <Vote className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No proposals yet</h3>
              <p className="text-slate-500">Be the first to create a proposal and start the governance process!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {proposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DAO;