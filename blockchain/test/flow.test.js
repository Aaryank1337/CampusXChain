// test/flow.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

let campToken, feeManager, eventNFT, campusDAO;
let owner, user1, user2;

describe("Full Project Flow", function () {
  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const CampToken = await ethers.getContractFactory("CampToken");
    campToken = await CampToken.deploy();
    await campToken.waitForDeployment();

    const FeeManager = await ethers.getContractFactory("FeeManager");
    feeManager = await FeeManager.deploy(await campToken.getAddress());
    await feeManager.waitForDeployment();

    const EventNFT = await ethers.getContractFactory("EventNFT");
    eventNFT = await EventNFT.deploy();
    await eventNFT.waitForDeployment();

    const CampusDAO = await ethers.getContractFactory("CampusDAO");
    campusDAO = await CampusDAO.deploy(await campToken.getAddress());
    await campusDAO.waitForDeployment();

    // Approve FeeManager to spend tokens
    await campToken.connect(owner).airdrop(user1.address, 100);
    await campToken.connect(user1).approve(await feeManager.getAddress(), 100);
  });

  it("should mint initial supply to deployer", async () => {
    const balance = await campToken.balanceOf(owner.address);
    expect(balance).to.be.gt(0);
  });

  it("should airdrop tokens to user1", async () => {
    const balance = await campToken.balanceOf(user1.address);
    expect(balance).to.equal(100);
  });

  it("should allow NFT minting", async () => {
    const tx = await eventNFT.connect(owner).mintPOAP(user1.address, "Web3 Workshop");
    await tx.wait();

    const balance = await eventNFT.balanceOf(user1.address);
    expect(balance).to.equal(1);

    const eventName = await eventNFT.getEventName(1);
    expect(eventName).to.equal("Web3 Workshop");
  });

  it("should allow proposal creation and voting", async () => {
    // Airdrop tokens and approve DAO
    await campToken.connect(owner).airdrop(user2.address, 50);
    await campToken.connect(user2).approve(await campusDAO.getAddress(), 50);

    const tx = await campusDAO.connect(owner).createProposal("Build a college DApp", 3600);
    await tx.wait();

    const proposal = await campusDAO.getProposal(1);
    expect(proposal.description).to.equal("Build a college DApp");

    await campusDAO.connect(user2).vote(1, true);
    const updated = await campusDAO.getProposal(1);
    expect(updated.yesVotes).to.equal(1);
  });
});
