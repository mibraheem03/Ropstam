const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Ropstam Token Contract", function () {


  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    [owner, addr1, addr2] = await ethers.getSigners();
    const Ropstam = await ethers.getContractFactory("Ropstam");
    const ropstam = await Ropstam.deploy();

    return { ropstam, owner, addr1, addr2 };
  }
  it("Should have the correct name, symbol, and decimals", async function () {
    const { ropstam } = await loadFixture(deployContract);
    const name = await ropstam.name();
    expect(await ropstam.name()).to.equal("Ropstam");
    expect(await ropstam.symbol()).to.equal("RST");
    expect(await ropstam.decimals()).to.equal(18);
  });

  it("Should buy the initial supply to the contract deployer", async function () {
    const { ropstam } = await loadFixture(deployContract);

    const initialSupply = ethers.parseUnits("100000", 18);
    const balance = await ropstam.balanceOf(owner.address);
    expect(balance).to.equal(initialSupply);
  });

  it("Should transfer tokens between accounts", async function () {
    const { ropstam, owner, addr1 } = await loadFixture(deployContract);

    const amountToTransfer = ethers.parseUnits("100", 18);
    await ropstam.transfer(addr1.address, amountToTransfer);
    const balanceOwner = await ropstam.balanceOf(owner.address);
    const balanceAddr1 = await ropstam.balanceOf(addr1.address);

    expect(balanceOwner).to.equal(
      ethers.parseUnits("100000", 18) - (amountToTransfer)
    );
    expect(balanceAddr1).to.equal(amountToTransfer);
  });

  it("Should apply 1% burn on transfers", async function () {
    const { ropstam } = await loadFixture(deployContract);

    const amountToTransfer = ethers.parseUnits("1000", 18);
    await ropstam.transfer(addr1.address, amountToTransfer);
    const totalSupplyBefore = await ropstam.totalSupply();

    const burnAmount = amountToTransfer.div(100); // 1% burn
    const expectedTotalSupplyAfter = totalSupplyBefore.sub(burnAmount);

    const totalSupplyAfter = await ropstam.totalSupply();
    expect(totalSupplyAfter).to.equal(expectedTotalSupplyAfter);

    const balanceOwner = await ropstam.balanceOf(owner.address);
    const balanceAddr1 = await ropstam.balanceOf(addr1.address);

    expect(balanceOwner).to.equal(
      ethers.parseUnits("100000", 18) - (amountToTransfer)
    );
    expect(balanceAddr1).to.equal(amountToTransfer - (burnAmount));
  });

  it("User should be able to buy tokens", async function () {
    const { ropstam } = await loadFixture(deployContract);

    const amountTobuy = ethers.parseUnits("5", 18);
    await ropstam.buy(amountTobuy);

    const balanceAddr1 = await ropstam.balanceOf(addr1.address);
    const totalSupply = await ropstam.totalSupply();

    expect(balanceAddr1).to.equal(amountTobuy);
    expect(totalSupply).to.equal(
      ethers.parseUnits("100000", 18) +(amountTobuy)
    );
  });

  it("Should not allow buying beyond the maximum supply", async function () {
    const { ropstam } = await loadFixture(deployContract);

    const maxSupply = ethers.parseUnits("1000000", 18);
    const currentSupply = await ropstam.totalSupply();
    const amountTobuy = maxSupply - ((currentSupply) + (1n));

    await expect(ropstam.buy(addr1.address, amountTobuy)).to.be.revertedWith(
      "Exceeds maximum supply"
    );
  });
});
