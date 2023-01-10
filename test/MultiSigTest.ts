import { expect, assert } from "chai";
import { ethers } from "hardhat";

describe("MultiSig", function () {
  let contract: any;
  let _required = 2;
  let accounts: any;

  let MultiSig: any;

  before(async () => {
    accounts = await ethers.provider.listAccounts();
    MultiSig = await ethers.getContractFactory("MultiSig");
    contract = await MultiSig.deploy(accounts.slice(0, 3), _required);
    await contract.deployed();
  });

  it("should set an array of owners", async () => {
    let firstOwner = await contract.callStatic.owners(0);
    let lastOwner = await contract.callStatic.owners(2);
    assert.equal(accounts[2], lastOwner);
    assert.equal(accounts[0], firstOwner);
  });

   it("should set the number of required confirmations", async function () {
     const required = await contract.required();
     assert.equal(_required, required.toNumber());
   });
  
  
  describe("for a multisig with no owners", () => {
    it("should revert", async () => {
      await expectThrow(MultiSig.deploy([], 1));
    });
  });

  describe("for a multisig with no required confirmations", () => {
    it("should revert", async () => {
      await expectThrow(MultiSig.deploy(accounts.slice(0, 3), 0));
    });
  });

  describe("for a multisig with more required confirmations than owners", () => {
    it("should revert", async () => {
      await expectThrow(MultiSig.deploy(accounts.slice(0, 3), 4));
    });
  });
});



async function expectThrow(promise:any) {
  const errMsg = "Expected throw not received";
  try {
    await promise;
  } catch (err) {
    return;
  }
  assert(false, errMsg);
}
