import React from 'react';
import { Coins, Award, CreditCard, Vote } from 'lucide-react';

export const Dashboard = ({ 
  campBalance, 
  userNFTs, 
  paymentStatus, 
  proposalCount, 
  loading 
}) => {
  return (
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
            <p className="text-gray-400 text-sm">Total Proposals</p>
            <p className="text-2xl font-bold text-white">{proposalCount}</p>
          </div>
          <Vote className="w-8 h-8 text-blue-500" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;