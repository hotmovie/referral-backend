// controllers/referralController.js
const Referral = require('../models/Referral');

// Controller to store a referral ID
const storeReferralId = async (req, res) => {
    const { referralId } = req.body;
    try {
        const referral = new Referral({ referralId, clickCount: 0, userPoints: 10 });
        await referral.save();
        res.status(201).json({ message: 'Referral ID stored successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error storing referral ID' });
    }
};

// Controller to increment click count for a referral
const incrementClickCount = async (req, res) => {
    const { referralId } = req.body;
    try {
        const referral = await Referral.findOneAndUpdate(
            { referralId },
            { $inc: { clickCount: 1, userPoints: 3 } }, // Increment clicks and points
            { new: true }
        );
        if (referral) {
            res.status(200).json({ message: 'Click count incremented', referral });
        } else {
            res.status(404).json({ error: 'Referral ID not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error incrementing click count' });
    }
};

// Controller to get referral count and points for a referral ID
const getReferralCount = async (req, res) => {
    const { referralId } = req.params;
    try {
        const referral = await Referral.findOne({ referralId });
        if (referral) {
            res.status(200).json({ referralId, clickCount: referral.clickCount, userPoints: referral.userPoints });
        } else {
            res.status(404).json({ error: 'Referral ID not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving referral data' });
    }
};

module.exports = {
    storeReferralId,
    incrementClickCount,
    getReferralCount,
};
