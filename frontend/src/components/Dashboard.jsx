import React from 'react';
import { Coins, Award, CreditCard, Vote, Loader } from 'lucide-react';

export const Dashboard = ({
  campBalance,
  userNFTs,
  paymentStatus,
  proposalCount,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* CAMP Balance Card */}
      <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 shadow-2xl shadow-purple-900/20">
        <div className="flex items-center justify-between mb-4">
          <Coins className="w-8 h-8 text-blue-400" />
          <div className="text-right">
            <p className="text-gray-400 text-sm">CAMP Balance</p>
            <p className="text-blue-400 text-2xl font-bold">
              {loading ? <Loader className="w-6 h-6 animate-spin" /> : `${campBalance} CAMP`}
            </p>
          </div>
        </div>
      </div>

      {/* NFTs Card */}
      <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 shadow-2xl shadow-purple-900/20">
        <div className="flex items-center justify-between mb-4">
          <Award className="w-8 h-8 text-yellow-400" />
          <div className="text-right">
            <p className="text-gray-400 text-sm">NFTs Owned</p>
            <p className="text-yellow-400 text-2xl font-bold">
              {loading ? <Loader className="w-6 h-6 animate-spin" /> : userNFTs.length}
            </p>
          </div>
        </div>
      </div>

      {/* Fee Status Card */}
      <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 shadow-2xl shadow-purple-900/20">
        <div className="flex items-center justify-between mb-4">
          <CreditCard className="w-8 h-8 text-green-400" />
          <div className="text-right">
            <p className="text-gray-400 text-sm">Fee Status</p>
            <p className={`text-2xl font-bold ${paymentStatus.isPaid ? 'text-green-400' : 'text-red-400'}`}>
              {loading ? (
                <Loader className="w-6 h-6 animate-spin" />
              ) : (
                paymentStatus.isPaid ? `Paid (${paymentStatus.amount} CAMP)` : 'Not Paid'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Total Proposals Card */}
      <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 shadow-2xl shadow-purple-900/20">
        <div className="flex items-center justify-between mb-4">
          <Vote className="w-8 h-8 text-purple-400" />
          <div className="text-right">
            <p className="text-gray-400 text-sm">Total Proposals</p>
            <p className="text-purple-400 text-2xl font-bold">
              {loading ? <Loader className="w-6 h-6 animate-spin" /> : proposalCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;