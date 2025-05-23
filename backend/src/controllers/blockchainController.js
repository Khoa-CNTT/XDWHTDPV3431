const blockchainService = require('../services/blockchainService');

// Tạo dự án từ thiện mới
const createNeed = async (req, res) => {
    try {
        const { title, description, targetAmount, deadline } = req.body;
        const creatorAddress = req.user.wallet_address;

        if (!creatorAddress) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'User wallet address not found'
                }
            });
        }

        const result = await blockchainService.createNeed(
            title,
            description,
            targetAmount,
            deadline,
            creatorAddress
        );

        return res.json({
            success: true,
            message: 'Charity need created successfully',
            transactionHash: result.tx
        });
    } catch (error) {
        console.error('Error creating charity need:', error);
        return res.status(500).json({
            success: false,
            error: {
                message: 'Error creating charity need',
                details: error.message
            }
        });
    }
};

// Quyên góp cho dự án
const contribute = async (req, res) => {
    try {
        const { needId } = req.params;
        const { amount, message } = req.body;
        const contributorAddress = req.user.wallet_address;

        console.log('Contribute controller hit:', {
            needId,
            amount,
            message,
            contributorAddress
        });

        if (!contributorAddress) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'User wallet address not found'
                }
            });
        }

        const result = await blockchainService.contribute(
            needId,
            amount,
            contributorAddress
        );

        return res.json({
            success: true,
            message: 'Contribution made successfully',
            transactionHash: result.tx
        });
    } catch (error) {
        console.error('Error making contribution:', error);
        return res.status(500).json({
            success: false,
            error: {
                message: 'Error making contribution',
                details: error.message
            }
        });
    }
};

// Lấy thông tin chi tiết dự án
const getNeedDetails = async (req, res) => {
    try {
        const { needId } = req.params;
        const details = await blockchainService.getNeedDetails(needId);
        return res.json({
            success: true,
            data: details
        });
    } catch (error) {
        console.error('Error getting need details:', error);
        return res.status(500).json({
            success: false,
            error: {
                message: 'Error getting need details',
                details: error.message
            }
        });
    }
};

// Lấy danh sách ID dự án
const getNeedIds = async (req, res) => {
    try {
        const needIds = await blockchainService.getNeedIds();
        return res.json({
            success: true,
            data: needIds
        });
    } catch (error) {
        console.error('Error getting need IDs:', error);
        return res.status(500).json({
            success: false,
            error: {
                message: 'Error getting need IDs',
                details: error.message
            }
        });
    }
};

// Rút tiền từ dự án
const withdrawFunds = async (req, res) => {
    try {
        const { needId } = req.params;
        const creatorAddress = req.user.wallet_address;

        if (!creatorAddress) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'User wallet address not found'
                }
            });
        }

        const result = await blockchainService.withdrawFunds(needId, creatorAddress);
        return res.json({
            success: true,
            message: 'Funds withdrawn successfully',
            transactionHash: result.tx
        });
    } catch (error) {
        console.error('Error withdrawing funds:', error);
        return res.status(500).json({
            success: false,
            error: {
                message: 'Error withdrawing funds',
                details: error.message
            }
        });
    }
};

// Export các controller functions
module.exports = {
    createNeed,
    contribute,
    getNeedDetails,
    getNeedIds,
    withdrawFunds
}; 