const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const referralRoutes = require('./routes/referralRoutes'); // Import the correct referralRoutes

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all origins


// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files (optional, if you have CSS or images)
app.use(express.static('public'));

app.use((req, res, next) => {
    console.log(req.url);
    next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

// Use routes
app.use('/api', referralRoutes); // Use referral routes for /api endpoint

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
