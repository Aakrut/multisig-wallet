import { ethers } from "hardhat";

const ownersAddresses:string[] = ["address1","address2","address3"];

async function main() {
  const contractFactory = await ethers.getContractFactory("MultiSig");
  const contractDeploy = await contractFactory.deploy(ownersAddresses, 2);

  await contractDeploy.deployed()

  console.log(`Contract Deployed at: ${contractDeploy.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
