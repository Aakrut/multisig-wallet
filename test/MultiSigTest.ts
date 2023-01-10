import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect ,assert} from "chai";
import { ethers } from "hardhat";

describe('MultiSig',function () {
  let contract : any;
  let _required = 2;
  let accounts:any;

  before(async () => {
     accounts = await ethers.provider.listAccounts();
    const MultiSig = await ethers.getContractFactory("MultiSig");
    contract = await MultiSig.deploy(accounts.slice(0, 3), _required);
    await contract.deployed();
  })

  it("should set an array of owners", async () => {
    let firstOwner = await contract.callStatic.owners(0);
    let lastOwner = await contract.callStatic.owners(2);
    assert.equal(accounts[2], lastOwner);
    assert.equal(accounts[0], firstOwner);
  })

  it("should set the number of required confirmations", async () => {
    const required = await contract.callStatic.required();
    assert.equal(_required, required);
  })
})