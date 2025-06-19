import React, { useState, useEffect } from 'react';
import { CreditCard, Loader, CheckCircle, AlertCircle } from 'lucide-react';

const Fees = ({ 
  account, 
  payFees, 
  fetchUserData, 
  loading, 
  setLoading, 
  getPaymentStatus, 
  campBalance,
  paymentStatus,
  setPaymentStatus 
}) => {
  const [feeForm, setFeeForm] = useState({ amount: '' });
  const [statusLoading, setStatusLoading] = useState(false);

  // Use the payment status from props (parent component)
  // Only fetch independently if not provided
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!account || !getPaymentStatus || paymentStatus !== undefined) {
        return;
      }
      
      try {
        setStatusLoading(true);
        const status = await getPaymentStatus(account);
        if (setPaymentStatus) {
          setPaymentStatus(status);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      } finally {
        setStatusLoading(false);
      }
    };

    checkPaymentStatus();
  }, [account, getPaymentStatus, paymentStatus, setPaymentStatus]);

  const handlePayFees = async () => {
    if (!feeForm.amount) {
      alert('Please enter an amount');
      return;
    }

    const feeAmount = parseFloat(feeForm.amount);
    const userBalance = parseFloat(campBalance);

    if (feeAmount > userBalance) {
      alert('Insufficient CAMP tokens. You need ' + feeAmount + ' CAMP but only have ' + userBalance + ' CAMP.');
      return;
    }
    
    try {
      setLoading(true);
      await payFees(feeForm.amount);
      setFeeForm({ amount: '' });
      
      // Refresh user data and payment status
      if (fetchUserData) {
        await fetchUserData();
      }
      
      alert('Fees paid successfully!');
    } catch (error) {
      console.error('Error paying fees:', error);
      alert('Failed to pay fees: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshPaymentStatus = async () => {
    if (!account || !getPaymentStatus) return;
    
    try {
      setStatusLoading(true);
      const status = await getPaymentStatus(account);
      if (setPaymentStatus) {
        setPaymentStatus(status);
      }
    } catch (error) {
      console.error('Error refreshing payment status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  // Show loading state while checking payment status
  if (statusLoading && paymentStatus === undefined) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
        <div className="flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-purple-500 mr-2" />
          <span className="text-white">Checking payment status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <CreditCard className="mr-3" />
        Fee Payment
      </h2>
      
      {/* Payment Status Display */}
      <div className="mb-6">
        <div className={`flex items-center p-4 rounded-lg ${
          paymentStatus 
            ? 'bg-green-900/30 border border-green-500/30' 
            : 'bg-red-900/30 border border-red-500/30'
        }`}>
          {paymentStatus ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <div className="flex-grow">
                <h3 className="text-green-400 font-semibold">Payment Status: PAID</h3>
                <p className="text-green-300 text-sm">Your fees have been successfully paid.</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <div className="flex-grow">
                <h3 className="text-red-400 font-semibold">Payment Status: UNPAID</h3>
                <p className="text-red-300 text-sm">You need to pay your fees to access all features.</p>
              </div>
            </>
          )}
          <button
            onClick={refreshPaymentStatus}
            disabled={statusLoading}
            className="ml-3 text-sm text-purple-400 hover:text-purple-300 underline disabled:opacity-50"
          >
            {statusLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>

      {/* Show payment form only if fees are not paid */}
      {!paymentStatus && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (CAMP Tokens)
            </label>
            <input
              type="number"
              value={feeForm.amount}
              onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="1000"
              disabled={loading}
              min="1"
              step="0.01"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-400">
                Enter the amount of CAMP tokens you want to pay as fees
              </p>
              <p className="text-sm text-blue-400">
                Balance: {campBalance} CAMP
              </p>
            </div>
          </div>
          
          <button
            onClick={handlePayFees}
            disabled={loading || !feeForm.amount || parseFloat(feeForm.amount) <= 0}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="w-4 h-4 inline mr-2 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4 inline mr-2" />
            )}
            {loading ? 'Processing...' : 'Pay Fees'}
          </button>
          
          <div className="text-sm text-gray-400 bg-gray-700/30 p-3 rounded-lg">
            <p><strong>Note:</strong> Make sure you have:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Sufficient CAMP tokens in your wallet</li>
              <li>Approved the FeeManager contract to spend your tokens</li>
              <li>Connected to the correct network</li>
            </ul>
          </div>
        </div>
      )}

      {/* Show message if fees are already paid */}
      {paymentStatus && (
        <div className="text-center text-gray-300 bg-green-900/10 p-6 rounded-lg border border-green-500/20">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-lg font-semibold mb-2">All Set! ✅</p>
          <p className="text-gray-300">Your fees are up to date. Thank you for your payment!</p>
          <p className="text-sm text-gray-400 mt-2">
            You now have full access to all platform features.
          </p>
        </div>
      )}
    </div>
  );
};

export default Fees;