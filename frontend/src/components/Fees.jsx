import React, { useState } from 'react';
import { CreditCard, Loader } from 'lucide-react';

export const Fees = ({ loading, onPayFees }) => {
  const [feeForm, setFeeForm] = useState({ amount: '' });

  const handlePayFees = async () => {
    if (!feeForm.amount) {
      alert('Please enter an amount');
      return;
    }
    await onPayFees(feeForm.amount);
    setFeeForm({ amount: '' });
  };

  return (
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
  );
};

export default Fees;