import { expect, assert } from "chai";
import { ethers } from "hardhat";
import fs from 'fs';

const errors = [
  "Make sure to declare a public uint for the transaction count!",
  "Make sure to declare a public mapping for the transactions!",
];

const error = "Make sure to declare a public uint for the confirmations!";

const jsonLoc = "./artifacts/contracts/MultiSig.sol/MultiSig.json";
const { abi } = JSON.parse(fs.readFileSync(jsonLoc).toString());

describe("MultiSig", function () {
  let contract:any;
  let accounts:any;
  let MultiSig: any;
  let zero = ethers.constants.AddressZero;
  
  before(async () => {
    MultiSig = await ethers.getContractFactory("MultiSig");
    accounts = await ethers.provider.listAccounts();
  });

  describe("for a valid multisig", () => {
    let _required = 2;
    before(async () => {
      contract = await MultiSig.deploy(accounts.slice(0, 3), _required);
      await contract.deployed();
    });

    it("should set an array of owners", async () => {
      let firstOwner = await contract.callStatic.owners(0);
      let lastOwner = await contract.callStatic.owners(2);
      assert.equal(accounts[2], lastOwner);
      assert.equal(accounts[0], firstOwner);
    });

    it("should set required confirmations", async () => {
      let required = await contract.callStatic.required();
      assert.equal(_required, required.toNumber());
    });
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


    it("should define the transaction count", async function () {
      const transactionCount = abi.filter(
        (x:any) => x.name === "transactionCount"
      )[0];
      assert(transactionCount, errors[0]);
      assert.deepEqual(
        transactionCount.outputs.map((x:any) => x.type),
        ["uint256"]
      );
    });

    it("should define a transactions mapping or array", async function () {
      const transactions = abi.filter((x:any) => x.name === "transactions")[0];
      assert(transactions, errors[1]);
      assert.deepEqual(
        transactions.inputs.map((x:any) => x.type),
        ["uint256"]
      );
      assert.deepEqual(
        transactions.outputs.map((x:any) => x.type),
        ["address", "uint256", "bool"]
      );
    });
  
  it('should define a confirmations mapping', async function () {
    const confirmations = abi.filter((x: any) => x.name === "confirmations")[0];
    assert(confirmations, error);
    assert.deepEqual(confirmations.inputs.map((x: any) => x.type), ['uint256', "address"
    ])
    assert.deepEqual(confirmations.outputs.map((x: any) => x.type), ["bool"])
  });

 describe("Submit Transaction Tests", function () {
   let _required = 2;
   beforeEach(async () => {
     accounts = await ethers.provider.listAccounts();
     const MultiSig = await ethers.getContractFactory("MultiSig");
     contract = await MultiSig.deploy(accounts.slice(0, 3), _required);
     await contract.deployed();
   });

   it("should add a transaction", async function () {
     await contract.submitTransaction(accounts[1], 100);
     let tx = await contract.callStatic.transactions(0);
     let address = tx[0];
     assert.notEqual(address, zero);
   });

   it("should confirm a transaction", async function () {
     await contract.submitTransaction(accounts[1], 100);

     let confirmed = await contract.callStatic.getConfirmationsCount(0);
     assert.equal(confirmed, 1);
   });

   it("should not call addTransaction externally", async function () {
     assert.equal(
       contract.addTransaction,
       undefined,
       "Did not expect addTransaction to be defined publicly!"
     );
   });
 });

  describe("Fallback Tests", function () {
    beforeEach(async () => {
      let _required = 2;
      accounts = await ethers.provider.listAccounts();
      const MultiSig = await ethers.getContractFactory("MultiSig");
      contract = await MultiSig.deploy(accounts.slice(0, 3), _required);
      await contract.deployed();
    });

    it("should accept funds", async function () {
      const value = ethers.utils.parseEther("1");
      await ethers.provider
        .getSigner(accounts[1])
        .sendTransaction({ to: contract.address, value });
      const balance = await ethers.provider.getBalance(contract.address);
      assert.equal(balance.toString(), value.toString());
    });
  });

  describe("Confirmed Tests", function () {
    beforeEach(async () => {
      let _required = 2;
      accounts = await ethers.provider.listAccounts();
      const MultiSig = await ethers.getContractFactory("MultiSig");
      contract = await MultiSig.deploy(accounts.slice(0, 3), _required);
      await contract.deployed();
    });

    it("should return true if the required threshold is met for a transaction", async function () {
      await contract.submitTransaction(accounts[1], 100);

      await contract
        .connect(ethers.provider.getSigner(accounts[1]))
        .confirmTransaction(0);
      const confirmed = await contract.callStatic.isConfirmed(0);

      assert.equal(confirmed, true);
    });

    it("should return false if the required threshold is not met for a transaction", async function () {
      await contract.submitTransaction(accounts[1], 100);

      let confirmed = await contract.callStatic.isConfirmed(0);

      assert.equal(confirmed, false);
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
