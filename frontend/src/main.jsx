import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {  Web3Provider } from "./context/BlockchainContext";
import { AuthProvider } from './context/AuthContext.jsx';
import { WalletProvider } from './context/WalletContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    
      <Web3Provider>
        <WalletProvider>
    <App />
    </WalletProvider>
  </Web3Provider>
  </AuthProvider>
  </StrictMode>,
)
