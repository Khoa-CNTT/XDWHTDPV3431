const Web3 = require('web3');
const path = require('path');
const CharityContract = require(path.join(__dirname, '../../../build/contracts/CharityContract.json'));

class BlockchainService {
    constructor() {
        console.log('BlockchainService constructor called');
        this.web3 = null;
        this.contract = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            // Kết nối đến Ethereum network
            this.web3 = new Web3(process.env.ETHEREUM_NODE_URL || 'http://localhost:7545');
            
            // Sử dụng địa chỉ contract đã triển khai
            const contractAddress = '0x37Cc5816352050B890E69A5726192fe711D1c200';
            
            // Khởi tạo contract instance
            this.contract = new this.web3.eth.Contract(
                CharityContract.abi,
                contractAddress
            );

            // Thêm account từ private key nếu có
            if (process.env.ETHEREUM_PRIVATE_KEY) {
                const account = this.web3.eth.accounts.privateKeyToAccount(process.env.ETHEREUM_PRIVATE_KEY);
                this.web3.eth.accounts.wallet.add(account);
                console.log('Added account from private key:', account.address);
            }

            this.initialized = true;
            console.log('Blockchain service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize blockchain service:', error);
            throw error;
        }
    }

    async createNeed(title, description, targetAmount, creatorAddress) {
        try {
            const result = await this.contract.methods.createNeed(
                title,
                description,
                targetAmount
            ).send({ 
                from: creatorAddress,
                gas: 3000000 // Add gas limit
            });
            return result;
        } catch (error) {
            console.error('Error creating need:', error);
            throw error;
        }
    }

    async contribute(needId, amount, contributorAddress) {
        if (!this.initialized) {
            throw new Error('Blockchain service not initialized');
        }

        try {
            console.log('Making contribution:', {
                needId,
                amount,
                contributorAddress
            });

            // Chuyển đổi amount sang Wei
            const amountInWei = this.web3.utils.toWei(amount.toString(), 'ether');

            // Gọi contract method
            const result = await this.contract.methods.contribute(needId)
                .send({
                    from: contributorAddress,
                    value: amountInWei,
                    gas: 3000000 // Add gas limit
                });

            console.log('Contribution successful:', result);
            return result;
        } catch (error) {
            console.error('Error making contribution:', error);
            throw error;
        }
    }

    async getNeedDetails(needId) {
        try {
            const details = await this.contract.methods.getNeedDetails(needId).call();
            return {
                title: details[0],
                description: details[1],
                creator: details[2],
                targetAmount: details[3].toString(),
                raisedAmount: details[4].toString(),
                isActive: details[5],
                createdAt: details[6].toString()
            };
        } catch (error) {
            console.error('Error getting need details:', error);
            throw error;
        }
    }

    async getNeedCount() {
        try {
            return await this.contract.methods.getNeedCount().call();
        } catch (error) {
            console.error('Error getting need count:', error);
            throw error;
        }
    }

    async getNeedIds() {
        try {
            return await this.contract.methods.getNeedIds().call();
        } catch (error) {
            console.error('Error getting need IDs:', error);
            throw error;
        }
    }

    async withdrawFunds(needId, creatorAddress) {
        try {
            const result = await this.contract.methods.withdrawFunds(
                needId
            ).send({ 
                from: creatorAddress,
                gas: 3000000 // Add gas limit
            });
            return result;
        } catch (error) {
            console.error('Error withdrawing funds:', error);
            throw error;
        }
    }
}

// Export một instance của BlockchainService
const blockchainService = new BlockchainService();
module.exports = blockchainService; 