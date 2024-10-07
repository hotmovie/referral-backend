const express = require('express');
const router = express.Router();
const Referral = require("../models/referral");

const getClientIp = (req) => {
    return req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.connection.remoteAddress;

};

// Route to store a referral ID



router.post('/storeReferral', async (req, res) => {
    const { referralId } = req.body;

    try {
        // Check if the referral ID already exists
        let referral = await Referral.findOne({ referralId });
        if (referral) {

            console.log("Referral ID already exists")

            return res.status(400).json({ message: 'Referral ID already exists' });
        }

        // If not, create a new referral entry
        referral = new Referral({
            referralId,
            clickCount: 0,
            userPoints: 10 // Initial points given to new users
        });

        await referral.save();
        console.log("Referral ID stored successfully");

        return res.status(201).json({ message: 'Referral ID stored successfully', referral });
    } catch (error) {
        console.log("Server error")

        return res.status(500).json({ error: 'Server error' });
    }
});

// Route to increment click count for a referral
router.post('/incrementClick', async (req, res) => {
    const { referralId } = req.body;
    const clientIp = getClientIp(req); // Get the client's IP address

    try {
        // Find the referral by ID
        const referral = await Referral.findOne({ referralId });
        if (!referral) {
            console.log("Referral ID not found");
            return res.status(404).json({ message: 'Referral ID not found' });
        }

        // Check if the IP address has already clicked
        if (referral.ipAddresses && referral.ipAddresses.includes(clientIp)) {
            console.log("This IP address has already claimed points for this referral.");
            return res.status(400).json({ message: 'Points already claimed for this IP address.' });
        }

        // Increment the click count and update the earned points
        referral.clickCount += 1;
        const newPoints = 3; // Award 3 points per referral click
        referral.userPoints += newPoints;

        // Initialize the ipAddresses array if it doesn't exist
        if (!referral.ipAddresses) {
            referral.ipAddresses = [];
        }

        // Add the client's IP address to the list
        referral.ipAddresses.push(clientIp);

        await referral.save();
        console.log("Click count incremented", referral);
        return res.status(200).json({ message: 'Click count incremented', referral });

    } catch (error) {
        console.log("Server error");
        return res.status(500).json({ error: 'Server error' });
    }
});

// Route to get referral data (click count, earned points, spent points, user points)
router.get('/getReferralCount', async (req, res) => {
    const { referralId } = req.query;

    try {
        // Find the referral by ID
        const referral = await Referral.findOne({ referralId });
        if (!referral) {
            console.log("Referral ID not found");

            return res.status(404).json({ message: 'Referral ID not found' });
        }

;


        return res.status(200).json({
            clickCount: referral.clickCount,
            userPoints: referral.userPoints
        });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});


// Route to get user points based on referral ID
router.get('/getUserPoints', async (req, res) => {
    const { referralId } = req.query;

    try {
        // Find the referral by ID
        const referral = await Referral.findOne({ referralId });
        if (!referral) {
            console.log("Referral ID not found");
            return res.status(404).json({ message: 'Referral ID not found' });
        }

        // Return user points
        return res.status(200).json({ userPoints: referral.userPoints });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});


// Route to update referral points (syncing earned, spent, and user points)
router.post('/updatePoints', async (req, res) => {
    const { referralId, userPoints } = req.body;

    try {
        // Find the referral by ID
        const referral = await Referral.findOne({ referralId });
        if (!referral) {

            console.log({ message: 'Referral ID not found' });

            return res.status(404).json({ message: 'Referral ID not found' });
        }

        // Update the earned, spent, and user points
        referral.userPoints = userPoints;

        await referral.save();
        console.log({ message: 'Points updated successfully', referral} )
        return res.status(200).json({ message: 'Points updated successfully', referral });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
