const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Ropstam Token Contract", () => {

  const zeroAddress = "0x0000000000000000000000000000000000000000"
  async function deploy() {
    // Deploy the contract and get accounts
    const Ropstam = await ethers.getContractFactory("Ropstam");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const ropstam = await Ropstam.deploy();
    await ropstam.waitForDeployment();
    return { ropstam, owner, addr1, addr2 }

  }
  it("Should deploy the contract correctly", async () => {
    const { ropstam } = await loadFixture(deploy);
    expect(await ropstam.name()).to.equal("ROPSTAM");
    expect(await ropstam.symbol()).to.equal("RST");
  });

  it("Should allow buying tokens and minting", async () => {
    const { ropstam, addr1, addr2, owner } = await loadFixture(deploy);
    const amountToBuy = 100;
    await ropstam.connect(addr1).buy(amountToBuy, { value: amountToBuy * 100 });
    expect(await ropstam.balanceOf(addr1.address)).to.equal(amountToBuy);
    expect(await ropstam.totalSupply()).to.equal(amountToBuy);
  });

  it("Should transfer tokens between accounts", async () => {
    const { ropstam, addr1, addr2, owner } = await loadFixture(deploy);
    const amountToBuy = 100;
    await ropstam.connect(addr1).buy(amountToBuy, { value: amountToBuy * 100 });
    const initialBalance = await ropstam.balanceOf(addr1.address);
    const transferAmount = 100n;
    const deflationaryAmount = 99n;
    await ropstam.connect(addr1).transfer(addr2.address, transferAmount);
    expect(await ropstam.balanceOf(addr1.address)).to.equal(initialBalance - transferAmount);
    expect(await ropstam.balanceOf(addr2.address)).to.equal(deflationaryAmount);
  });

  it("Should not allow transfers from the zero address", async () => {
    const { ropstam, addr1, addr2, owner } = await loadFixture(deploy);
    const amountToBuy = 100;
    await ropstam.connect(addr1).buy(amountToBuy, { value: amountToBuy * 100 });
    await expect(ropstam.connect(addr1).transfer(zeroAddress, 100)).to.be.revertedWith("ERC20: transfer to the zero address");
  });

  it("Should not allow transfers exceeding balance", async () => {
    const { ropstam, addr1, addr2, owner } = await loadFixture(deploy);
    const balance = String(await ropstam.balanceOf(addr1.address));
    await expect(ropstam.connect(addr1).transfer(addr1.address, balance + 1)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("Should not allow transfers if allowance is insufficient", async () => {
    const { ropstam, addr1, addr2, owner } = await loadFixture(deploy);
    const transferAmount = 100;
    await ropstam.connect(addr1).approve(owner.address, transferAmount - 1);
    await expect(ropstam.transferFrom(addr1.address, addr2.address, transferAmount)).to.be.revertedWith("ERC20: insufficient allowance");
  });

  it("Should approve and transferFrom tokens correctly", async () => {
    const { ropstam, addr1, addr2, owner } = await loadFixture(deploy);
    const amountToBuy = 100;
    await ropstam.connect(addr1).buy(amountToBuy, { value: amountToBuy * 100 });
    const initialBalance = await ropstam.balanceOf(owner.address);
    const transferAmount = 100;
    await ropstam.connect(addr1).approve(owner.address, transferAmount);
    await ropstam.transferFrom(addr1.address, addr2.address, transferAmount);
    expect(await ropstam.allowance(addr1.address, owner.address)).to.equal(0);
    expect(await ropstam.balanceOf(addr1.address)).to.equal(0);
    expect(await ropstam.balanceOf(addr2.address)).to.equal(BigInt(transferAmount) - 1n);
  });

  it("Should burn tokens when transferring", async () => {
    const { ropstam, addr1, addr2, owner } = await loadFixture(deploy);
    const transferAmount = 100;
    const amountToBuy = 100;
    await ropstam.connect(owner).buy(amountToBuy, { value: amountToBuy * 100 });
    const initialBalance = Number(await ropstam.balanceOf(owner.address));
    await ropstam.transfer(addr1.address, transferAmount);
    const balanceAfter = await ropstam.balanceOf(owner.address)
    const expectedBalance = Number(initialBalance - transferAmount);
    expect(Number(balanceAfter)).to.equal(expectedBalance);
    const totalSupply = Number(await ropstam.totalSupply());
    expect(Number(await ropstam.balanceOf(addr1.address))).to.equal(Number(transferAmount - (transferAmount * 1) / 100));
    expect(totalSupply).to.equal(100 - (transferAmount * 1) / 100);
  });
});
