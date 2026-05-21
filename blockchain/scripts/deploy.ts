import hre from 'hardhat';

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  if (!deployer) {
    throw new Error("No deployer account found. Check your PRIVATE_KEY in .env");
  }

  console.log("Deploying CarbonCreditToken with account:");
  console.log(deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance (in Wei):", balance.toString());

  const CarbonToken = await hre.ethers.getContractFactory("CarbonCreditToken");
  
  // Pass the deployer's address as the initialOwner for the CarbonCreditToken constructor
  const carbonToken = await CarbonToken.deploy(deployer.address);

  await carbonToken.waitForDeployment();

  const contractAddress = await carbonToken.getAddress();

  console.log("===================================");
  console.log("CarbonCreditToken deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Token Name: Carbon MRV Credit");
  console.log("Token Symbol: CMRV");
  console.log("===================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
