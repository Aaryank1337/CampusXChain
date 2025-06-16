async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with:", deployer.address);

    // Deploy CAMP Token
    const CampToken = await ethers.getContractFactory("CampToken");
    const campToken = await CampToken.deploy();
    await campToken.waitForDeployment();
    console.log("CampToken deployed at:", campToken.target);

    // Deploy FeeManager with token address
    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = await FeeManager.deploy(campToken.target);
    await feeManager.waitForDeployment();
    console.log("FeeManager deployed at:", feeManager.target);

    // Deploy EventNFT
    const EventNFT = await ethers.getContractFactory("EventNFT");
    const eventNFT = await EventNFT.deploy();
    await eventNFT.waitForDeployment();
    console.log("EventNFT deployed at:", eventNFT.target);

    // Deploy CampusDAO with token address
    const CampusDAO = await ethers.getContractFactory("CampusDAO");
    const campusDAO = await CampusDAO.deploy(campToken.target);
    await campusDAO.waitForDeployment();
    console.log("CampusDAO deployed at:", campusDAO.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
