const Web3 = require('web3');
const Contract = require('@truffle/contract');
const path = require('path');
const CharityContractArtifact = require(path.join(__dirname, '../../../build/contracts/CharityContract.json'));

class BlockchainService {
    constructor() {
        this.web3 = new Web3(process.env.ETHEREUM_NODE_URL || 'http://localhost:7545');
        this.contract = Contract(CharityContractArtifact);
        this.contract.setProvider(this.web3.currentProvider);
    }

    async initialize() {
        try {
            this.instance = await this.contract.deployed();
            console.log('Blockchain service initialized successfully');
            console.log('Contract address:', this.instance.address);
        } catch (error) {
            console.error('Failed to initialize blockchain service:', error);
            throw error;
        }
    }

    async createNeed(title, description, targetAmount, creatorAddress) {
        try {
            const result = await this.instance.createNeed(
                title,
                description,
                targetAmount,
                { from: creatorAddress }
            );
            return result;
        } catch (error) {
            console.error('Error creating need:', error);
            throw error;
        }
    }

    async contribute(needId, amount, contributorAddress) {
        try {
            const result = await this.instance.contribute(
                needId,
                { from: contributorAddress, value: amount }
            );
            return result;
        } catch (error) {
            console.error('Error making contribution:', error);
            throw error;
        }
    }

    async getNeed(needId) {
        try {
            const need = await this.instance.getNeed(needId);
            return {
                id: need.id.toString(),
                title: need.title,
                description: need.description,
                targetAmount: need.targetAmount.toString(),
                currentAmount: need.currentAmount.toString(),
                creator: need.creator,
                isActive: need.isActive,
                createdAt: need.createdAt.toString()
            };
        } catch (error) {
            console.error('Error getting need details:', error);
            throw error;
        }
    }

    async getContributions(needId) {
        try {
            const contributions = await this.instance.getContributions(needId);
            return contributions.map(contribution => ({
                needId: contribution.needId.toString(),
                contributor: contribution.contributor,
                amount: contribution.amount.toString(),
                timestamp: contribution.timestamp.toString()
            }));
        } catch (error) {
            console.error('Error getting contributions:', error);
            throw error;
        }
    }
}

module.exports = new BlockchainService(); 