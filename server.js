const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api'); // Import the Telegram bot library
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

// Initialize the Telegram bot
const token = "7600581723:AAG7hYBLiNr6b30adTZoKNZwT7t8-9QPpng"; // Use your bot token from environment variables
const userStates = {};
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Check if the user has sent a message before
    if (!userStates[chatId]) {
        // If not, send the "Hello" message and set their state
        bot.sendMessage(chatId, 'Hello!')
            .catch(err => {
                console.error(`Failed to send message to chat ${chatId}:`, err);
            });
        userStates[chatId] = 1; // Mark that the user has sent their first message
    } else if (userStates[chatId] === 1) {
        // If the user has already sent one message, send the subscription alert
        const replyMessage = `🚨 <b>Price Drop Alert!</b> 🚨  
💸 <b>Join Our Premium Channel for Less!</b> 💸  

🎉 <b>Great news! We’ve reduced the subscription price!</b>  

⏳ <b>Hurry! This exclusive link is valid for the next 24 hours only!</b>  

🔥 <b>Why Should You Join?</b>  
✅ Access premium content at a reduced price!  
✅ Limited-time offer – <b>act fast and don't miss out!</b>  

👉 <b>Join us here:</b> <a href="https://t.me/+f_srqCC-ydtmODJl">https://t.me/+f_srqCC-ydtmODJl</a>`;

        // Send the subscription alert message
        bot.sendMessage(chatId, replyMessage, { parse_mode: 'HTML' })
            .catch(err => {
                console.error(`Failed to send subscription message to chat ${chatId}:`, err);
            });
        
        // Update the user's state
        userStates[chatId] = 2; // Mark that the user has sent their second message
    } else if (userStates[chatId] === 2) {
        // If the user has already sent two messages, send the query message
        const queryMessage = `For more queries, you can message us here: https://t.me/team_bigCity`;
        
        // Send the query message
        bot.sendMessage(chatId, queryMessage)
            .catch(err => {
                console.error(`Failed to send query message to chat ${chatId}:`, err);
            });
        
        // Optionally, reset or update the user's state
        userStates[chatId] = 3; // Mark that the user has sent their third message
    }
});

// Global error handling for polling errors
bot.on("polling_error", (error) => {
    console.error("Polling error:", error.code); // => 'EFATAL' or 'ECONNREFUSED'
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
