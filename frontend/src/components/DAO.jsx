import React, { useState } from 'react';
import { Plus, Vote, Check, X, Loader } from 'lucide-react';

export const DAO = ({ proposals, loading, onCreateProposal, onVote, onRefreshProposals }) => {
  const [proposalForm, setProposalForm] = useState({ description: '', duration: '' });
  const [voteForm, setVoteForm] = useState({ proposalId: '', support: true });

  const handleCreateProposal = async () => {
    if (!proposalForm.description || !proposalForm.duration) {
      alert('Please fill in all fields');
      return;
    }
    await onCreateProposal(proposalForm.description, proposalForm.duration);
    setProposalForm({ description: '', duration: '' });
  };

  const handleVote = async () => {
    if (voteForm.proposalId === '') {
      alert('Please enter a proposal ID');
      return;
    }
    await onVote(voteForm.proposalId, voteForm.support);
    setVoteForm({ proposalId: '', support: true });
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              disabled={loading}
            />
          </div>
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
            onClick={handleVote}
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

      <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Vote className="mr-3" />
            Active Proposals
          </h2>
          <button
            onClick={onRefreshProposals}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </button>
        </div>
        
        <div className="space-y-4">
          {proposals.length > 0 ? proposals.map((proposal) => (
            <div key={proposal.id} className="bg-gray-700/50 rounded-lg p-6 border border-purple-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">Proposal #{proposal.id}</h3>
                  <p className="text-gray-300 mb-3">{proposal.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-400">
                      Creator: {formatAddress(proposal.creator)}
                    </span>
                    <span className="text-gray-400">
                      Deadline: {formatTimestamp(proposal.deadline)}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  proposal.executed 
                    ? 'bg-green-600/20 text-green-400' 
                    : Date.now() < proposal.deadline * 1000 
                      ? 'bg-blue-600/20 text-blue-400' 
                      : 'bg-purple-600/20 text-purple-400'
                }`}>
                  {proposal.executed 
                    ? 'Executed' 
                    : Date.now() < proposal.deadline * 1000 
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
                        proposal.forVotes + proposal.againstVotes + proposal.abstainVotes > 0
                          ? (proposal.forVotes / (proposal.forVotes + proposal.againstVotes + proposal.abstainVotes)) * 100
                          : 0
                      }%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0 votes</span>
                  <span>{proposal.forVotes + proposal.againstVotes + proposal.abstainVotes} total votes</span>
                </div>
              </div>
            </div>
          )) : (
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