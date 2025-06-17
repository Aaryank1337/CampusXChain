import React, { useState } from 'react';
import { Award, Loader } from 'lucide-react';

export const NFTs = ({ userNFTs, loading, onMintNFT }) => {
  const [nftForm, setNftForm] = useState({ address: '', eventName: '' });

  const handleMintNFT = async () => {
    if (!nftForm.address || !nftForm.eventName) {
      alert('Please fill in all fields');
      return;
    }
    await onMintNFT(nftForm.address, nftForm.eventName);
    setNftForm({ address: '', eventName: '' });
  };

  return (
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
  );
};

export default NFTs;