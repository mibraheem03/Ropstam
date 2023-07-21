// hammerAndOpenApes.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HammerAndOpenApes Contract", () => {
    let HammerAndOpenApes;
    let hammerAndOpenApes;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async () => {
        HammerAndOpenApes = await ethers.getContractFactory("HammerAndOpenApes");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        hammerAndOpenApes = await HammerAndOpenApes.deploy([owner.address, addr1.address, addr2.address]);
        await hammerAndOpenApes.deployed();
    });

    it("Should deploy the contract correctly", async () => {
        expect(await hammerAndOpenApes.name()).to.equal("Hammer");
        expect(await hammerAndOpenApes.symbol()).to.equal("HAMMER");
    });

    it("Should mint initial Hammer tokens correctly", async () => {
        const totalSupply = await hammerAndOpenApes.totalSupply();
        expect(totalSupply).to.equal(10000 ether);
    });

    it("Should purchase Open Ape NFT correctly", async () => {
        // Purchase Open Ape NFT for addr1
        await expect(() => hammerAndOpenApes.connect(addr1).purchaseOpenApe({ value: 100 ether }))
            .to.changeEtherBalance(addr1, -100 ether);

        // Check if addr1 owns an Open Ape
        const ownedOpenApe = await hammerAndOpenApes._ownedOpenApes(await hammerAndOpenApes._getApesTokenId(addr1.address));
        expect(ownedOpenApe).to.equal(true);

        // Check if the contract balance increased by 100 ether
        const contractBalance = await ethers.provider.getBalance(hammerAndOpenApes.address);
        expect(contractBalance).to.equal(100 ether);
    });

    it("Should not allow purchasing Open Ape if already owned", async () => {
        // Purchase Open Ape NFT for addr1
        await hammerAndOpenApes.connect(addr1).purchaseOpenApe({ value: 100 ether });

        // Try purchasing Open Ape NFT again for addr1 (already owns one)
        await expect(hammerAndOpenApes.connect(addr1).purchaseOpenApe({ value: 100 ether }))
            .to.be.revertedWith("You already own an Open Ape.");

        // Check if addr1 still owns one Open Ape
        const ownedOpenApe = await hammerAndOpenApes._ownedOpenApes(await hammerAndOpenApes._getApesTokenId(addr1.address));
        expect(ownedOpenApe).to.equal(true);
    });

    it("Should not allow transfer of Hammer if owned an Open Ape", async () => {
        // Purchase Open Ape NFT for addr1
        await hammerAndOpenApes.connect(addr1).purchaseOpenApe({ value: 100 ether });

        // Transfer Hammer from addr1 to addr2 (should fail due to owning an Open Ape)
        await expect(hammerAndOpenApes.connect(addr1).transfer(addr2.address, 100 ether))
            .to.be.revertedWith("You own an Open Ape, cannot own a Hammer.");

        // Check if the transfer didn't happen
        const balanceOfAddr2 = await hammerAndOpenApes.balanceOf(addr2.address);
        expect(balanceOfAddr2).to.equal(0);
    });

    it("Should allow transfer of Hammer if not owned an Open Ape", async () => {
        // Transfer Hammer from owner to addr1
        await hammerAndOpenApes.transfer(addr1.address, 100 ether);

        // Check if addr1 received 100 HAMMER tokens
        const balanceOfAddr1 = await hammerAndOpenApes.balanceOf(addr1.address);
        expect(balanceOfAddr1).to.equal(100 ether);
    });

    it("Should allow adding new owners by existing owners", async () => {
        // Add addr3 as a new owner by owner
        await expect(hammerAndOpenApes.connect(owner).addOwner(addr1.address))
            .to.not.be.reverted;

        // Check if addr3 is an owner now
        expect(await hammerAndOpenApes.isOwner(addr1.address)).to.equal(true);
    });

    it("Should not allow adding new owners by non-owners", async () => {
        // Try adding addr3 as a new owner by addr1 (not an owner)
        await expect(hammerAndOpenApes.connect(addr1).addOwner(addr2.address))
            .to.be.revertedWith("Ownable: caller is not the owner");

        // Check if addr3 is not an owner now
        expect(await hammerAndOpenApes.isOwner(addr2.address)).to.equal(false);
    });

    it("Should allow contract owners to withdraw balance", async () => {
        // Purchase Open Ape NFT for addr1
        await hammerAndOpenApes.connect(addr1).purchaseOpenApe({ value: 100 ether });

        // Withdraw contract balance by owner
        await expect(hammerAndOpenApes.connect(owner).withdraw())
            .to.changeEtherBalance(owner, 100 ether);
    });

    it("Should not allow non-owners to withdraw balance", async () => {
        // Try to withdraw contract balance by addr1 (not an owner)
        await expect(hammerAndOpenApes.connect(addr1).withdraw())
            .to.be.revertedWith("Ownable: caller is not the owner");

        // Check if addr1 balance didn't change
        const balanceOfAddr1 = await ethers.provider.getBalance(addr1.address);
        expect(balanceOfAddr1).to.equal(100 ether);
    });
});
