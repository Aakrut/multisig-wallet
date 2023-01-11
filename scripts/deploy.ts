import { ethers } from "hardhat";

async function main() {
  const contractFactory = await ethers.getContractFactory("MultiSig");
  const contractDeploy = await contractFactory.deploy(["address1", "address2"], 2);

  await contractDeploy.deployed()

  console.log(`Contract Deployed at: ${contractDeploy.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
