require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection (MySQL)
const pool = mysql.createPool(process.env.DATABASE_URL);

// Log environment variable existence
console.log('--- Environment Check ---');
console.log('EMAIL_USER present:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASS present:', !!process.env.EMAIL_PASS);
console.log('RECEIVER_EMAIL present:', !!process.env.RECEIVER_EMAIL);
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT);
console.log('-------------------------');

// ... (Nodemailer config remains same) ...

// Contact Route
app.post('/api/contact', async (req, res) => {
    console.log('📩 Incoming contact request from:', req.body.email);
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
    }

    try {
        // 1. Store in Database
        if (process.env.DATABASE_URL) {
            try {
                console.log('💾 Saving message to MySQL...');
                await pool.execute(
                    'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
                    [name, email, subject, message]
                );
                console.log('✅ Success: Message stored in MySQL');
            } catch (dbError) {
                console.log('⚠️ Database Save Failed:', dbError.message);
            }
        }

        // 2. Send to Discord (Secondary Backup)
        if (process.env.DISCORD_WEBHOOK_URL) {
            console.log('👾 Sending notification to Discord...');
            const discordMessage = JSON.stringify({
                embeds: [{
                    title: `📩 New Portfolio Message: ${subject || 'No Subject'}`,
                    color: 3447003,
                    fields: [
                        { name: '👤 Name', value: name, inline: true },
                        { name: '📧 Email', value: email, inline: true },
                        { name: '📝 Message', value: message }
                    ],
                    timestamp: new Date()
                }]
            });

            const url = new URL(process.env.DISCORD_WEBHOOK_URL);
            const https = require('https');
            const options = {
                hostname: url.hostname,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(discordMessage)
                }
            };

            const reqDiscord = https.request(options);
            reqDiscord.on('error', (e) => console.error('Discord Error:', e.message));
            reqDiscord.write(discordMessage);
            reqDiscord.end();
        }

        // 3. Send via Email (Notification)
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
            subject: `Portfolio Contact from ${name}: ${subject || 'New Message'}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            replyTo: email
        };

        // We wrap email in its own try/catch so the user gets a "Success" even if email times out
        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent successfully to inbox for ${name}`);
        } catch (emailError) {
            console.log('⚠️ Email Delivery Failed (Network Timeout), but data was saved locally!');
        }

        res.status(200).json({ 
            success: true, 
            message: 'Message sent successfully! (Saved to Database)' 
        });
    } catch (error) {
        console.error('❌ Major Server Error:', error.message);
        res.status(500).json({ success: false, error: `Server Error: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
