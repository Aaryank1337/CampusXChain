import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/BlockchainContext';
import { useWallet } from '../context/WalletContext';
import { 
  Users, 
  Coins, 
  Calendar, 
  TrendingUp, 
  Wallet, 
  Vote, 
  Gift, 
  CreditCard,
  Award,
  Plus,
  Check,
  X,
  Play,
  Bell,
  User,
  Loader
} from 'lucide-react';
import Navbar from '../components/Navbar';

const CampusXChainApp = () => {
  const {
    account,
    campToken,
    campusDAO,
    feeManager,
    eventNFT,
    isInitialized,
    airdropTokens,
    payFees,
    mintPOAP,
    createProposal,
    vote,
    getPaymentStatus,
    getEventName,
    getUserNFTs,
    getProposal
  } = useWeb3();

  const { isConnected, connectWallet, walletAddress, balance: ethBalance } = useWallet();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campBalance, setCampBalance] = useState('0');
  const [userNFTs, setUserNFTs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forms state
  const [airdropForm, setAirdropForm] = useState({ address: '', amount: '' });
  const [feeForm, setFeeForm] = useState({ amount: '' });
  const [nftForm, setNftForm] = useState({ address: '', eventName: '' });
  const [proposalForm, setProposalForm] = useState({ description: '', duration: '' });
  const [voteForm, setVoteForm] = useState({ proposalId: '', support: true });

  useEffect(() => {
    if (account && isInitialized) {
      fetchUserData();
    }
  }, [account, isInitialized]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      if (campToken && account) {
        const balance = await campToken.balanceOf(account);
        // Convert from wei to tokens (assuming 18 decimals)
        const formattedBalance = (Number(balance) / 1e18).toFixed(2);
        setCampBalance(formattedBalance);
      }
      
      if (eventNFT && account) {
        const nfts = await getUserNFTs(account);
        setUserNFTs(Array.isArray(nfts) ? nfts : []);
      }
      
      if (feeManager && account) {
        const status = await getPaymentStatus(account);
        setPaymentStatus(status);
      }

      // Fetch recent proposals
      if (campusDAO) {
        await fetchProposals();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      // Fetch last 5 proposals (assuming proposal IDs are sequential)
      const proposalPromises = [];
      for (let i = 0; i < 5; i++) {
        try {
          const proposal = await getProposal(i);
          if (proposal) {
            proposalPromises.push({ id: i, ...proposal });
          }
        } catch (error) {
          // Proposal doesn't exist, continue
          break;
        }
      }
      setProposals(proposalPromises);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const handleAirdrop = async () => {
    if (!airdropForm.address || !airdropForm.amount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await airdropTokens(airdropForm.address, airdropForm.amount);
      setAirdropForm({ address: '', amount: '' });
      await fetchUserData();
      alert('Airdrop successful!');
    } catch (error) {
      console.error('Airdrop failed:', error);
      alert(`Airdrop failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFees = async () => {
    if (!feeForm.amount) {
      alert('Please enter an amount');
      return;
    }

    try {
      setLoading(true);
      await payFees(feeForm.amount);
      setFeeForm({ amount: '' });
      await fetchUserData();
      alert('Fee payment successful!');
    } catch (error) {
      console.error('Fee payment failed:', error);
      alert(`Fee payment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMintNFT = async () => {
    if (!nftForm.address || !nftForm.eventName) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await mintPOAP(nftForm.address, nftForm.eventName);
      setNftForm({ address: '', eventName: '' });
      await fetchUserData();
      alert('NFT minted successfully!');
    } catch (error) {
      console.error('NFT minting failed:', error);
      alert(`NFT minting failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!proposalForm.description || !proposalForm.duration) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await createProposal(proposalForm.description, proposalForm.duration);
      setProposalForm({ description: '', duration: '' });
      await fetchProposals();
      alert('Proposal created successfully!');
    } catch (error) {
      console.error('Proposal creation failed:', error);
      alert(`Proposal creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!voteForm.proposalId) {
      alert('Please enter a proposal ID');
      return;
    }

    try {
      setLoading(true);
      await vote(voteForm.proposalId, voteForm.support);
      setVoteForm({ proposalId: '', support: true });
      await fetchProposals();
      alert('Vote cast successfully!');
    } catch (error) {
      console.error('Voting failed:', error);
      alert(`Voting failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-purple-600 text-white' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <>
        <Navbar/>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-white">Initializing Web3...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
     <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-16">
      {/* Connection Status */}
      {!isConnected && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
          <div className="bg-yellow-600/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/20">
            <div className="text-center">
              <p className="text-yellow-200 mb-4">Please connect your wallet to use the application</p>
              <button 
                onClick={connectWallet}
                className="bg-gradient-to-br from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Wallet className="w-4 h-4 inline mr-2" />
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Status */}
      {isConnected && account && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-white text-lg font-semibold mb-4">Wallet Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-green-400 text-2xl font-bold">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
                </div>
                <div className="text-gray-400 text-sm">Wallet Address</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 text-2xl font-bold">
                  {loading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : `${campBalance} CAMP`}
                </div>
                <div className="text-gray-400 text-sm">Token Balance</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${paymentStatus ? 'text-green-400' : 'text-red-400'}`}>
                  {loading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : (paymentStatus ? 'Paid' : 'Pending')}
                </div>
                <div className="text-gray-400 text-sm">Fee Status</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {isConnected && account && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            <TabButton id="dashboard" label="Dashboard" icon={TrendingUp} active={activeTab === 'dashboard'} onClick={setActiveTab} />
            <TabButton id="tokens" label="Tokens" icon={Coins} active={activeTab === 'tokens'} onClick={setActiveTab} />
            <TabButton id="nfts" label="NFTs" icon={Award} active={activeTab === 'nfts'} onClick={setActiveTab} />
            <TabButton id="fees" label="Fees" icon={CreditCard} active={activeTab === 'fees'} onClick={setActiveTab} />
            <TabButton id="dao" label="DAO" icon={Vote} active={activeTab === 'dao'} onClick={setActiveTab} />
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">CAMP Balance</p>
                      <p className="text-2xl font-bold text-white">{campBalance}</p>
                    </div>
                    <Coins className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">NFTs Owned</p>
                      <p className="text-2xl font-bold text-white">{userNFTs.length}</p>
                    </div>
                    <Award className="w-8 h-8 text-pink-500" />
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Fee Status</p>
                      <p className="text-2xl font-bold text-white">{paymentStatus ? 'Paid' : 'Pending'}</p>
                    </div>
                    <CreditCard className={`w-8 h-8 ${paymentStatus ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Proposals</p>
                      <p className="text-2xl font-bold text-white">{proposals.length}</p>
                    </div>
                    <Vote className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Coins className="mr-3" />
                  Token Management
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Recipient Address</label>
                    <input
                      type="text"
                      value={airdropForm.address}
                      onChange={(e) => setAirdropForm({...airdropForm, address: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0x..."
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                    <input
                      type="number"
                      value={airdropForm.amount}
                      onChange={(e) => setAirdropForm({...airdropForm, amount: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="100"
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={handleAirdrop}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                    ) : (
                      <Gift className="w-4 h-4 inline mr-2" />
                    )}
                    Airdrop Tokens
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'fees' && (
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <CreditCard className="mr-3" />
                  Fee Payment
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount (CAMP Tokens)</label>
                    <input
                      type="number"
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="1000"
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={handlePayFees}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 inline mr-2" />
                    )}
                    Pay Fees
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'nfts' && (
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Award className="mr-3" />
                  Event NFTs (POAP)
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Recipient Address</label>
                    <input
                      type="text"
                      value={nftForm.address}
                      onChange={(e) => setNftForm({...nftForm, address: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0x..."
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Event Name</label>
                    <input
                      type="text"
                      value={nftForm.eventName}
                      onChange={(e) => setNftForm({...nftForm, eventName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Hackathon 2024"
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={handleMintNFT}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                    ) : (
                      <Award className="w-4 h-4 inline mr-2" />
                    )}
                    Mint POAP
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userNFTs.length > 0 ? userNFTs.map((nft, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-4 border border-purple-500/20">
                      <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                        <Award className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-white font-semibold">Event NFT #{nft.toString()}</h3>
                      <p className="text-gray-400 text-sm">POAP Token</p>
                    </div>
                  )) : (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                      No NFTs found
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'dao' && (
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
                      <div className="flex gap-4">
                        <button
                          onClick={() => setVoteForm({...voteForm, support: true})}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                            voteForm.support 
                              ? 'border-green-500 bg-green-500/20 text-green-400' 
                              : 'border-gray-600 bg-gray-700 text-gray-400 hover:border-green-500'
                          }`}
                          disabled={loading}
                        >
                          <Check className="w-4 h-4 inline mr-2" />
                          Support
                        </button>
                        <button
                          onClick={() => setVoteForm({...voteForm, support: false})}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                            !voteForm.support 
                              ? 'border-red-500 bg-red-500/20 text-red-400' 
                              : 'border-gray-600 bg-gray-700 text-gray-400 hover:border-red-500'
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
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Recent Proposals */}
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Calendar className="mr-3" />
                    Recent Proposals
                  </h2>
                  
                  <div className="space-y-4">
                    {proposals.length > 0 ? proposals.map((proposal, index) => (
                      <div key={index} className="bg-gray-700/50 rounded-lg p-6 border border-purple-500/20">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-white font-semibold text-lg">Proposal #{proposal.id}</h3>
                            <p className="text-gray-300 mt-2">{proposal.description || 'No description available'}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Status</div>
                            <div className="text-green-400 font-semibold">Active</div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-400">
                          <div>For: {proposal.forVotes || 0}</div>
                          <div>Against: {proposal.againstVotes || 0}</div>
                          <div>Abstain: {proposal.abstainVotes || 0}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-gray-400 py-8">
                        No proposals found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    
    </div>
    </>
  );
};

export default CampusXChainApp;