const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api'); // Import the Telegram bot library
require('dotenv').config();

const referralRoutes = require('./routes/referralRoutes'); // Import the correct referralRoutes
const Message = require('./models/Message'); // Import the Message model

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

app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 }); // Fetch messages in descending order
        res.json(messages); // Return messages as JSON
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get('/message', (req, res) => {
    res.render('messages'); // Render the messages.ejs template
});

// Initialize the Telegram bot
const token = process.env.TELEGRAM_BOT_TOKEN; // Use your bot token from environment variables
const userStates = {};
const bot = new TelegramBot(token, {
    polling: {
        interval: 100, // milliseconds
        timeout: 10,
        autoStart: true,
        dropPendingUpdates: true, // Option to drop pending updates if your bot can't keep up
    },
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Save the user's message to the database
    try {
        const userMessage = new Message({
            chatId: chatId,
            message: msg.text,
        });
        await userMessage.save(); // Save message to the database
        console.log(`Message saved for chat ID ${chatId}: ${msg.text}`);
    } catch (err) {
        console.error('Error saving message to database:', err);
    }

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

👉 <b>Join us here:</b> <a href="https://t.me/+IEHJSLOvHKBjYWE1">https://t.me/+IEHJSLOvHKBjYWE1</a>`;

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
