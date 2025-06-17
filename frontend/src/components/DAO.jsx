import React, { useState, useEffect } from 'react';
import { Plus, Vote, Check, X, Loader, RefreshCw } from 'lucide-react';

export const DAO = ({ 
  proposals, 
  loading, 
  setLoading,
  createProposal,
  vote,
  fetchProposals,
  formatAddress,
  formatTimestamp
}) => {
  const [proposalForm, setProposalForm] = useState({ description: '', duration: '' });
  const [voteForm, setVoteForm] = useState({ proposalId: '', support: true });
  const [localProposals, setLocalProposals] = useState([]);

  // Update local proposals when props change
  useEffect(() => {
    if (proposals) {
      setLocalProposals(proposals);
    }
  }, [proposals]);

  const handleCreateProposal = async () => {
    if (!proposalForm.description || !proposalForm.duration) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      await createProposal(proposalForm.description, proposalForm.duration);
      setProposalForm({ description: '', duration: '' });
      
      // Wait a bit for the transaction to be mined
      setTimeout(async () => {
        try {
          const updatedProposals = await fetchProposals();
          setLocalProposals(updatedProposals);
        } catch (error) {
          console.error('Error refreshing proposals:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Failed to create proposal: ' + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId = null, support = null) => {
    const voteProposalId = proposalId || voteForm.proposalId;
    const voteSupport = support !== null ? support : voteForm.support;
    
    if (voteProposalId === '') {
      alert('Please enter a proposal ID');
      return;
    }
    
    // Find the proposal to check if voting is still active
    const proposal = localProposals.find(p => p.id.toString() === voteProposalId.toString());
    if (!proposal) {
      alert('Proposal not found');
      return;
    }
    
    // Check if voting period has ended
    const currentTime = Date.now();
    const deadlineTime = proposal.deadline * 1000; // Convert to milliseconds
    
    if (currentTime >= deadlineTime) {
      alert('Voting period for this proposal has ended');
      return;
    }
    
    if (proposal.executed) {
      alert('This proposal has already been executed');
      return;
    }
    
    try {
      setLoading(true);
      await vote(voteProposalId, voteSupport);
      
      if (!proposalId) {
        setVoteForm({ proposalId: '', support: true });
      }
      
      // Refresh proposals after voting
      setTimeout(async () => {
        try {
          const updatedProposals = await fetchProposals();
          setLocalProposals(updatedProposals);
        } catch (error) {
          console.error('Error refreshing proposals:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error voting:', error);
      // More specific error handling
      if (error.message.includes('Voting ended')) {
        alert('Voting period for this proposal has ended');
      } else if (error.message.includes('Already voted')) {
        alert('You have already voted on this proposal');
      } else {
        alert('Failed to cast vote: ' + (error.reason || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const updatedProposals = await fetchProposals();
      setLocalProposals(updatedProposals);
    } catch (error) {
      console.error('Error refreshing proposals:', error);
      alert('Failed to refresh proposals');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if proposal is active
  const isProposalActive = (proposal) => {
    const currentTime = Date.now();
    const deadlineTime = proposal.deadline * 1000;
    return currentTime < deadlineTime && !proposal.executed;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Create Proposal Section */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Plus className="mr-3" />
          Create Proposal
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Proposal Description</label>
            <textarea
              value={proposalForm.description}
              onChange={(e) => setProposalForm({...proposalForm, description: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe your proposal..."
              rows="4"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration (in days)</label>
            <input
              type="number"
              value={proposalForm.duration}
              onChange={(e) => setProposalForm({...proposalForm, duration: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="7"
              min="1"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleCreateProposal}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="w-4 h-4 inline mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 inline mr-2" />
            )}
            Create Proposal
          </button>
        </div>
      </div>

      {/* Vote on Proposal Section */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Vote className="mr-3" />
          Vote on Proposal
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Proposal ID</label>
            <input
              type="number"
              value={voteForm.proposalId}
              onChange={(e) => setVoteForm({...voteForm, proposalId: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
              min="0"
              disabled={loading}
            />
          </div>
          
          {/* Show warning if selected proposal is not active */}
          {voteForm.proposalId && localProposals && (() => {
            const selectedProposal = localProposals.find(p => p.id.toString() === voteForm.proposalId);
            if (selectedProposal && !isProposalActive(selectedProposal)) {
              return (
                <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">
                    ⚠️ This proposal is no longer active for voting
                    {selectedProposal.executed ? ' (already executed)' : ' (voting period ended)'}
                  </p>
                </div>
              );
            }
            return null;
          })()}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Vote</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setVoteForm({...voteForm, support: true})}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  voteForm.support 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                }`}
                disabled={loading}
              >
                <Check className="w-4 h-4 inline mr-2" />
                For
              </button>
              <button
                onClick={() => setVoteForm({...voteForm, support: false})}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  !voteForm.support 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                }`}
                disabled={loading}
              >
                <X className="w-4 h-4 inline mr-2" />
                Against
              </button>
            </div>
          </div>
          <button
            onClick={() => handleVote()}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="w-4 h-4 inline mr-2 animate-spin" />
            ) : (
              <Vote className="w-4 h-4 inline mr-2" />
            )}
            Cast Vote
          </button>
        </div>
      </div>

      {/* Proposals List Section */}
      <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Vote className="mr-3" />
            All Proposals ({localProposals.length})
          </h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </button>
        </div>
        
        <div className="space-y-4">
          {localProposals && localProposals.length > 0 ? 
            // Sort proposals by ID in descending order (newest first)
            [...localProposals].sort((a, b) => b.id - a.id).map((proposal) => {
              const isActive = isProposalActive(proposal);
              const totalVotes = Number(proposal.forVotes) + Number(proposal.againstVotes) + Number(proposal.abstainVotes);
              
              return (
                <div key={proposal.id} className="bg-gray-700/50 rounded-lg p-6 border border-purple-500/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">Proposal #{proposal.id}</h3>
                      <p className="text-gray-300 mb-3">{proposal.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-400">
                          Creator: {formatAddress ? formatAddress(proposal.creator) : `${proposal.creator.slice(0, 6)}...${proposal.creator.slice(-4)}`}
                        </span>
                        <span className="text-gray-400">
                          Deadline: {formatTimestamp ? formatTimestamp(proposal.deadline) : new Date(proposal.deadline * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      proposal.executed 
                        ? 'bg-green-600/20 text-green-400' 
                        : isActive
                          ? 'bg-blue-600/20 text-blue-400' 
                          : 'bg-red-600/20 text-red-400'
                    }`}>
                      {proposal.executed 
                        ? 'Executed' 
                        : isActive
                          ? 'Active' 
                          : 'Ended'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-green-400 text-xl font-bold">
                        {proposal.forVotes}
                      </div>
                      <div className="text-gray-400 text-sm">For</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 text-xl font-bold">
                        {proposal.againstVotes}
                      </div>
                      <div className="text-gray-400 text-sm">Against</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-xl font-bold">
                        {proposal.abstainVotes}
                      </div>
                      <div className="text-gray-400 text-sm">Abstain</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            totalVotes > 0
                              ? (Number(proposal.forVotes) / totalVotes) * 100
                              : 0
                          }%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0 votes</span>
                      <span>{totalVotes} total votes</span>
                    </div>
                  </div>
                  
                  {/* Quick vote buttons for active proposals */}
                  {isActive && (
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleVote(proposal.id, true)}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                      >
                        <Check className="w-3 h-3 inline mr-1" />
                        Vote For
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, false)}
                        disabled={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                      >
                        <X className="w-3 h-3 inline mr-1" />
                        Vote Against
                      </button>
                    </div>
                  )}
                </div>
              );
            }) : (
            <div className="text-center text-gray-400 py-8">
              <Vote className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No proposals found</p>
              <p className="text-sm">Create the first proposal to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DAO;