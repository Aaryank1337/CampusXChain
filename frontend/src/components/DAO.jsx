import React, { useState, useEffect } from 'react';
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
      
      setProposals(proposalList.reverse()); // Show newest first
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

  // Load proposals on component mount
  useEffect(() => {
    if (isInitialized && account) {
      fetchProposals();
    }
  }, [isInitialized, account, campusDAO]);

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access the DAO</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campus DAO</h1>
          <p className="text-gray-600">Participate in campus governance and decision making</p>
        </div>

        {/* Create Proposal Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            disabled={loading}
          >
            {showCreateForm ? 'Cancel' : 'Create New Proposal'}
          </button>
        </div>

        {/* Create Proposal Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Proposal</h2>
            <form onSubmit={handleCreateProposal}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposal Description
                </label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your proposal..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voting Duration (days)
                </label>
                <input
                  type="number"
                  value={newProposal.duration}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, duration: parseInt(e.target.value) || 7 }))}
                  min="1"
                  max="30"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Submit Proposal'}
              </button>
            </form>
          </div>
        )}

        {/* Proposals List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Proposals ({proposals.length})
          </h2>
          
          {loading && proposals.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading proposals...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No proposals yet. Be the first to create one!</p>
            </div>
          ) : (
            proposals.map((proposal) => (
              <div key={proposal.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Proposal #{proposal.id}
                    </h3>
                    <p className="text-gray-700">{proposal.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      proposal.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {proposal.active ? 'Active' : 'Ended'}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTimeLeft(proposal.timeLeft)}
                    </p>
                  </div>
                </div>

                {/* Vote Counts */}
                <div className="flex space-x-6 mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Yes: {proposal.yesVotes}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">
                      No: {proposal.noVotes}
                    </span>
                  </div>
                </div>

                {/* Vote Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-l-full transition-all duration-300"
                      style={{ 
                        width: `${proposal.yesVotes + proposal.noVotes === 0 
                          ? 0 
                          : (proposal.yesVotes / (proposal.yesVotes + proposal.noVotes)) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Voting Buttons */}
                {proposal.active && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVote(proposal.id, true)}
                      disabled={votingStates[`${proposal.id}-true`]}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {votingStates[`${proposal.id}-true`] ? 'Voting...' : 'Vote Yes'}
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, false)}
                      disabled={votingStates[`${proposal.id}-false`]}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {votingStates[`${proposal.id}-false`] ? 'Voting...' : 'Vote No'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchProposals}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Proposals'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DAO;