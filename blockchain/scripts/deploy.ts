import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const provider = new ethers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  const accounts = await provider.listAccounts();

  const deployer = await provider.getSigner(0);

  console.log("Deploying CarbonCreditToken with account:");
  console.log(accounts[0]);

  const balance = await provider.getBalance(accounts[0]);

  console.log("Account balance:");
  console.log(balance.toString());

  const artifact = await hre.artifacts.readArtifact(
    "CarbonCreditToken"
  );

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    deployer
  );

  const carbonToken = await factory.deploy(
    accounts[0]
  );

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