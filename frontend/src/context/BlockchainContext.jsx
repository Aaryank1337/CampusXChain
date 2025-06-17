import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

// Import ABI files - make sure these paths are correct
// If your ABI files export the entire JSON, use .default
// If they export just the ABI array, import directly
import CampTokenAbi from "../abis/CampToken.json";
import CampusDAOAbi from "../abis/CampusDAO.json";
import FeeManagerAbi from "../abis/FeeManager.json";
import EventNFTAbi from "../abis/EventNFT.json";

const Web3Context = createContext();

const contractAddresses = {
  CampToken: "0x371857E84F131c9cF70a1E0aDE71ACa82F180E44",
  CampusDAO: "0xbdc87Fa0847c77e91396a75bf8B2E60E08F15Fa0",
  FeeManager: "0xF8e338B4031F2ab7F8Cf925B308850ed52cC8ae8",
  EventNFT: "0xd08934169D71D41D3d2C728d3Fa427cA083F89d0",
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [campToken, setCampToken] = useState(null);
  const [campusDAO, setCampusDAO] = useState(null);
  const [feeManager, setFeeManager] = useState(null);
  const [eventNFT, setEventNFT] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          
          // Check if wallet is connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length === 0) {
            console.log("No accounts connected");
            setIsInitialized(true);
            return;
          }

          const signer = await web3Provider.getSigner();
          const account = await signer.getAddress();

          // Handle different ABI import formats
          const getCampTokenAbi = () => {
            if (CampTokenAbi.abi) return CampTokenAbi.abi;
            if (Array.isArray(CampTokenAbi)) return CampTokenAbi;
            return CampTokenAbi.default?.abi || CampTokenAbi.default;
          };

          const getCampusDAOAbi = () => {
            if (CampusDAOAbi.abi) return CampusDAOAbi.abi;
            if (Array.isArray(CampusDAOAbi)) return CampusDAOAbi;
            return CampusDAOAbi.default?.abi || CampusDAOAbi.default;
          };

          const getFeeManagerAbi = () => {
            if (FeeManagerAbi.abi) return FeeManagerAbi.abi;
            if (Array.isArray(FeeManagerAbi)) return FeeManagerAbi;
            return FeeManagerAbi.default?.abi || FeeManagerAbi.default;
          };

          const getEventNFTAbi = () => {
            if (EventNFTAbi.abi) return EventNFTAbi.abi;
            if (Array.isArray(EventNFTAbi)) return EventNFTAbi;
            return EventNFTAbi.default?.abi || EventNFTAbi.default;
          };

          // Create contract instances
          const campTokenContract = new ethers.Contract(
            contractAddresses.CampToken, 
            getCampTokenAbi(), 
            signer
          );
          
          const campusDAOContract = new ethers.Contract(
            contractAddresses.CampusDAO, 
            getCampusDAOAbi(), 
            signer
          );
          
          const feeManagerContract = new ethers.Contract(
            contractAddresses.FeeManager, 
            getFeeManagerAbi(), 
            signer
          );
          
          const eventNFTContract = new ethers.Contract(
            contractAddresses.EventNFT, 
            getEventNFTAbi(), 
            signer
          );

          // Set all state variables
          setProvider(web3Provider);
          setSigner(signer);
          setAccount(account);
          setCampToken(campTokenContract);
          setCampusDAO(campusDAOContract);
          setFeeManager(feeManagerContract);
          setEventNFT(eventNFTContract);
          setIsInitialized(true);

          console.log("Web3 initialized successfully");
        } else {
          console.error("Please install MetaMask!");
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing Web3:", error);
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  // Contract interaction functions with proper error handling
  const airdropTokens = async (to, amount) => {
    if (!campToken) {
      throw new Error("CampToken contract not initialized");
    }
    
    try {
      // Convert amount to proper format (assuming 18 decimals)
      const parsedAmount = ethers.parseUnits(amount.toString(), 18);
      const tx = await campToken.airdrop(to, parsedAmount);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Airdrop error:", error);
      throw error;
    }
  };

  const transferTokens = async (to, amount) => {
  if (!campToken) {
    throw new Error("CampToken contract not initialized");
  }

  try {
    const parsedAmount = ethers.parseUnits(amount.toString(), 18);
    const tx = await campToken.transfer(to, parsedAmount);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Transfer error:", error);
    throw error;
  }
};

  const payFees = async (amount) => {
    if (!campToken || !feeManager) {
      throw new Error("Contracts not initialized");
    }
    
    try {
      const parsedAmount = ethers.parseUnits(amount.toString(), 18);
      
      // First approve the fee manager to spend tokens
      const approveTx = await campToken.approve(contractAddresses.FeeManager, parsedAmount);
      await approveTx.wait();
      
      // Then pay the fees
      const payTx = await feeManager.payFees(parsedAmount);
      await payTx.wait();
      return payTx;
    } catch (error) {
      console.error("Pay fees error:", error);
      throw error;
    }
  };

  const mintPOAP = async (to, eventName) => {
    if (!eventNFT) {
      throw new Error("EventNFT contract not initialized");
    }
    
    try {
      const tx = await eventNFT.mintPOAP(to, eventName);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Mint POAP error:", error);
      throw error;
    }
  };

  const createProposal = async (description, duration) => {
    if (!campusDAO) {
      throw new Error("CampusDAO contract not initialized");
    }
    
    try {
      const tx = await campusDAO.createProposal(description, duration);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Create proposal error:", error);
      throw error;
    }
  };

  const vote = async (proposalId, support) => {
    if (!campusDAO) {
      throw new Error("CampusDAO contract not initialized");
    }
    
    try {
      const tx = await campusDAO.vote(proposalId, support);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Vote error:", error);
      throw error;
    }
  };

  const getPaymentStatus = async (student) => {
    if (!feeManager) {
      throw new Error("FeeManager contract not initialized");
    }
    
    try {
      return await feeManager.getPaymentStatus(student);
    } catch (error) {
      console.error("Get payment status error:", error);
      return false;
    }
  };

  const getEventName = async (tokenId) => {
    if (!eventNFT) {
      throw new Error("EventNFT contract not initialized");
    }
    
    try {
      return await eventNFT.getEventName(tokenId);
    } catch (error) {
      console.error("Get event name error:", error);
      return "";
    }
  };

  const getUserNFTs = async (user) => {
    if (!eventNFT) {
      throw new Error("EventNFT contract not initialized");
    }
    
    try {
      return await eventNFT.getUserNFTs(user);
    } catch (error) {
      console.error("Get user NFTs error:", error);
      return [];
    }
  };

  const getProposal = async (proposalId) => {
    if (!campusDAO) {
      throw new Error("CampusDAO contract not initialized");
    }
    
    try {
      return await campusDAO.getProposal(proposalId);
    } catch (error) {
      console.error("Get proposal error:", error);
      return null;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
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
        getProposal,
        transferTokens,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};