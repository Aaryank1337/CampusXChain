import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/BlockchainContext';
import { ethers } from 'ethers';
import { AlertCircle, CheckCircle, Loader, DollarSign, Wallet, CreditCard, Info, Shield } from 'lucide-react';

const FeePayment = ({ onPaymentSuccess }) => {
  const {
    account,
    campToken,
    feeManager,
    payFees,
    getPaymentStatus,
    isInitialized
  } = useWeb3();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({ isPaid: false, amount: '0' });

  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch payment status
  const fetchPaymentStatus = async () => {
    if (!account || !getPaymentStatus) return;
    
    try {
      const [isPaid, paidAmount] = await getPaymentStatus(account);
      setPaymentStatus({
        isPaid,
        amount: ethers.formatUnits(paidAmount || 0, 18)
      });
    } catch (error) {
      console.error('Error fetching payment status:', error);
      setPaymentStatus({ isPaid: false, amount: '0' });
    }
  };

  useEffect(() => {
    if (isInitialized && account) {
      fetchPaymentStatus();
    }
  }, [isInitialized, account, campToken, feeManager]);

  const handlePayFees = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > 1000000) { // Arbitrary large number check
      setError('Amount too large');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setTxHash('');

    try {
      console.log('Paying fees:', amount, 'CAMP tokens');
      const tx = await payFees(amount);
      
      setTxHash(tx.hash);
      setSuccess(`Payment successful! Transaction hash: ${tx.hash}`);
      
      // Refresh payment status
      await fetchPaymentStatus();
      
      // Call parent callback to refresh main app data
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      
      // Reset form
      setAmount('');
      
    } catch (error) {
      console.error('Payment error:', error);
      
      // Handle specific error types
      if (error.message.includes('insufficient funds')) {
        setError('Insufficient funds for gas fees');
      } else if (error.message.includes('user rejected')) {
        setError('Transaction rejected by user');
      } else if (error.message.includes('Transfer failed')) {
        setError('Token transfer failed. Please check your balance and allowance.');
      } else {
        setError(error.message || 'Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"></div>
              <Loader className="absolute inset-0 m-auto animate-spin h-8 w-8 text-white" />
            </div>
          </div>
          <p className="mt-6 text-center text-slate-300 text-lg font-medium">Initializing Web3...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-3xl p-12 border border-slate-700/50 shadow-2xl text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mb-6 flex items-center justify-center">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
          <p className="text-slate-400 text-lg">Please connect your wallet to pay fees</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center py-6 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mb-4 flex items-center justify-center shadow-2xl">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Fee Payment
          </h1>
          <p className="text-slate-400">Pay your fees using CAMP tokens</p>
        </div>

        {/* Enhanced Payment Form - Full Width Horizontal Layout */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl mb-8">
          <h3 className="text-2xl font-semibold text-white mb-8 flex items-center justify-center">
            <DollarSign className="h-6 w-6 mr-3 text-purple-400" />
            Make Payment
          </h3>
          
          {/* Horizontal Form Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Amount Input - Takes more space */}
            <div className="lg:col-span-5">
              <label htmlFor="amount" className="block text-sm font-semibold text-slate-300 mb-3">
                Amount (CAMP Tokens)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-6 py-4 bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 text-white placeholder-slate-400 text-lg font-medium backdrop-blur-sm transition-all duration-300"
                  disabled={loading}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">
                  CAMP
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="lg:col-span-4">
              <button
                onClick={handlePayFees}
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-4 px-6 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin mr-3"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-5 w-5 mr-3" />
                    Pay Fees
                  </>
                )}
              </button>
            </div>

            {/* Current Payment Status */}
            <div className="lg:col-span-3">
              {paymentStatus.isPaid ? (
                <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 backdrop-blur-xl rounded-2xl p-4 border border-emerald-500/30 shadow-xl">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center mr-2">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="text-emerald-400 font-semibold text-sm">Paid</div>
                      <div className="text-emerald-300 text-xs">
                        {parseFloat(paymentStatus.amount).toFixed(4)} CAMP
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 backdrop-blur-xl rounded-2xl p-4 border border-slate-600/30 shadow-xl">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center mr-2">
                      <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 font-semibold text-sm">Pending</div>
                      <div className="text-slate-500 text-xs">
                        No payment yet
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm mb-3">Quick amounts:</p>
            <div className="flex flex-wrap gap-3">
              {[10, 50, 100, 500, 1000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-slate-700/50 to-slate-800/50 hover:from-purple-600/20 hover:to-blue-600/20 border border-slate-600/50 hover:border-purple-500/50 rounded-xl text-slate-300 hover:text-white transition-all duration-300 text-sm font-medium"
                >
                  {quickAmount} CAMP
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Instructions Card */}
          <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white">How to Pay</h4>
            </div>
            <ul className="text-blue-200 space-y-2 text-sm">
              <li>• Enter the amount of CAMP tokens you want to pay</li>
              <li>• Click "Pay Fees" to initiate the transaction</li>
              <li>• Confirm the transaction in your wallet</li>
              <li>• Wait for blockchain confirmation</li>
            </ul>
          </div>

          {/* Security Card */}
          <div className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center mr-3">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white">Secure Payment</h4>
            </div>
            <ul className="text-emerald-200 space-y-2 text-sm">
              <li>• All transactions are secured by blockchain</li>
              <li>• Your wallet remains in your control</li>
              <li>• No personal information is stored</li>
              <li>• Transaction history is immutable</li>
            </ul>
          </div>
        </div>

        {/* Messages Row */}
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-br from-red-900/30 to-rose-900/30 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 shadow-2xl">
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center mr-4">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-red-300 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30 shadow-2xl">
              <div className="flex items-start justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center mr-4 flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="text-emerald-300 text-center">
                  <div className="font-semibold mb-2">Payment Successful!</div>
                  {txHash && (
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                      <span className="text-xs text-slate-400">Transaction Hash: </span>
                      <span className="text-xs font-mono break-all text-emerald-200">{txHash}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeePayment;