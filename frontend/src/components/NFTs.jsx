import React, { useState, useEffect } from 'react';
import { Award, Loader } from 'lucide-react';
import { useWeb3 } from '../context/BlockchainContext'; // Adjust path as needed

export const NFTs = ({ userNFTs, loading, onMintNFT }) => {
  const [nftForm, setNftForm] = useState({ address: '', eventName: '' });
  const [nftsWithEventNames, setNftsWithEventNames] = useState([]);
  const [loadingEventNames, setLoadingEventNames] = useState(false);
  const { getEventName } = useWeb3();

  // Fetch event names for all NFTs
  useEffect(() => {
    const fetchEventNames = async () => {
      if (userNFTs.length === 0) {
        setNftsWithEventNames([]);
        return;
      }

      setLoadingEventNames(true);
      try {
        const nftsWithNames = await Promise.all(
          userNFTs.map(async (tokenId) => {
            try {
              const eventName = await getEventName(tokenId);
              return {
                tokenId: tokenId.toString(),
                eventName: eventName || `Event #${tokenId}`, // Fallback if no event name
                displayName: eventName ? `${eventName}` : `Event NFT #${tokenId}`
              };
            } catch (error) {
              console.error(`Error fetching event name for token ${tokenId}:`, error);
              return {
                tokenId: tokenId.toString(),
                eventName: `Event #${tokenId}`,
                displayName: `Event NFT #${tokenId}`
              };
            }
          })
        );
        setNftsWithEventNames(nftsWithNames);
      } catch (error) {
        console.error('Error fetching event names:', error);
        // Fallback to showing token IDs
        const fallbackNfts = userNFTs.map(tokenId => ({
          tokenId: tokenId.toString(),
          eventName: `Event #${tokenId}`,
          displayName: `Event NFT #${tokenId}`
        }));
        setNftsWithEventNames(fallbackNfts);
      } finally {
        setLoadingEventNames(false);
      }
    };

    fetchEventNames();
  }, [userNFTs, getEventName]);

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
        Your Event NFTs (POAP)
      </h2>
      

      {/* NFTs Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loadingEventNames ? (
          <div className="col-span-3 text-center text-gray-400 py-8">
            <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading event details...
          </div>
        ) : nftsWithEventNames.length > 0 ? (
          nftsWithEventNames.map((nft, index) => (
            <div key={index} className="bg-gray-700/50 rounded-lg p-4 border border-purple-500/20">
              <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                <Award className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">
                {nft.eventName}
              </h3>
              <p className="text-gray-400 text-sm mb-1">
                Token ID: #{nft.tokenId}
              </p>
              <p className="text-purple-400 text-xs">
                POAP Certificate
              </p>
            </div>
          ))
        ) : userNFTs.length > 0 ? (
          // Fallback display while loading event names
          userNFTs.map((nft, index) => (
            <div key={index} className="bg-gray-700/50 rounded-lg p-4 border border-purple-500/20">
              <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                <Award className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-white font-semibold">Event NFT #{nft.toString()}</h3>
              <p className="text-gray-400 text-sm">Loading event details...</p>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-400 py-8">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No POAPs found</p>
            <p className="text-sm">Attend events to earn POAP certificates!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTs;