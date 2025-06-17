import React, { useState } from 'react';
import { Gift, Send, Loader } from 'lucide-react';

export const Tokens = ({ isOwner, loading, onAirdrop, onTransfer }) => {
  const [airdropForm, setAirdropForm] = useState({ address: '', amount: '' });
  const [transferForm, setTransferForm] = useState({ address: '', amount: '' });

  const handleAirdrop = async () => {
    if (!airdropForm.address || !airdropForm.amount) {
      alert('Please fill in all fields');
      return;
    }
    await onAirdrop(airdropForm.address, airdropForm.amount);
    setAirdropForm({ address: '', amount: '' });
  };

  const handleTransfer = async () => {
    if (!transferForm.address || !transferForm.amount) {
      alert('Please fill in all fields');
      return;
    }
    await onTransfer(transferForm.address, transferForm.amount);
    setTransferForm({ address: '', amount: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Gift className="mr-3" />
          Airdrop Tokens
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
              disabled={loading || !isOwner}
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
              disabled={loading || !isOwner}
            />
          </div>
          {!isOwner ? (
            <div className="bg-yellow-600/20 text-yellow-200 p-3 rounded-lg text-sm">
              Only contract owner can perform airdrops
            </div>
          ) : (
            <button
              onClick={handleAirdrop}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="w-4 h-4 inline mr-2 animate-spin" />
              ) : (
                <Gift className="w-4 h-4 inline mr-2" />
              )}
              Airdrop Tokens
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Send className="mr-3" />
          Transfer Tokens
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Recipient Address</label>
            <input
              type="text"
              value={transferForm.address}
              onChange={(e) => setTransferForm({...transferForm, address: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0x..."
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="100"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleTransfer}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="w-4 h-4 inline mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 inline mr-2" />
            )}
            Transfer Tokens
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tokens;