const blockchainService = require('../services/blockchainService');

const contribute = async (req, res) => {
    try {
        const { needId } = req.params;
        const { amount, message } = req.body;
        const contributorAddress = req.user.wallet_address;

        console.log('Contribute controller called:', {
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

        res.json({
            success: true,
            message: 'Contribution made successfully',
            transactionHash: result.tx
        });
    } catch (error) {
        console.error('Error making contribution:', error);
        res.status(500).json({ 
            success: false,
            error: {
                message: 'Error making contribution',
                details: error.message
            }
        });
    }
};

module.exports = contribute; 