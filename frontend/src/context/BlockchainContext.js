import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import CampTokenAbi from "../abi/CampToken.json";
import CampusDAOAbi from "../abi/CampusDAO.json";
import FeeManagerAbi from "../abi/FeeManager.json";
import EventNFTAbi from "../abi/EventNFT.json";

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

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await web3Provider.getSigner();
        const account = await signer.getAddress();

        const campToken = new ethers.Contract(contractAddresses.CampToken, CampTokenAbi.abi, signer);
        const campusDAO = new ethers.Contract(contractAddresses.CampusDAO, CampusDAOAbi.abi, signer);
        const feeManager = new ethers.Contract(contractAddresses.FeeManager, FeeManagerAbi.abi, signer);
        const eventNFT = new ethers.Contract(contractAddresses.EventNFT, EventNFTAbi.abi, signer);

        setProvider(web3Provider);
        setSigner(signer);
        setAccount(account);
        setCampToken(campToken);
        setCampusDAO(campusDAO);
        setFeeManager(feeManager);
        setEventNFT(eventNFT);
      } else {
        console.error("Please install MetaMask!");
      }
    };

    init();
  }, []);

  const airdropTokens = async (to, amount) => {
    const tx = await campToken.airdrop(to, amount);
    await tx.wait();
  };

  const payFees = async (amount) => {
    const tx = await campToken.approve(contractAddresses.FeeManager, amount);
    await tx.wait();
    const payTx = await feeManager.payFees(amount);
    await payTx.wait();
  };

  const mintPOAP = async (to, eventName) => {
    const tx = await eventNFT.mintPOAP(to, eventName);
    await tx.wait();
  };

  const createProposal = async (description, duration) => {
    const tx = await campusDAO.createProposal(description, duration);
    await tx.wait();
  };

  const vote = async (proposalId, support) => {
    const tx = await campusDAO.vote(proposalId, support);
    await tx.wait();
  };

  const getPaymentStatus = async (student) => {
    return await feeManager.getPaymentStatus(student);
  };

  const getEventName = async (tokenId) => {
    return await eventNFT.getEventName(tokenId);
  };

  const getUserNFTs = async (user) => {
    return await eventNFT.getUserNFTs(user);
  };

  const getProposal = async (proposalId) => {
    return await campusDAO.getProposal(proposalId);
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        campToken,
        campusDAO,
        feeManager,
        eventNFT,
        airdropTokens,
        payFees,
        mintPOAP,
        createProposal,
        vote,
        getPaymentStatus,
        getEventName,
        getUserNFTs,
        getProposal,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
