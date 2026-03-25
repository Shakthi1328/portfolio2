require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
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

// Log environment variable existence (but hide actual values for security)
console.log('--- Environment Check ---');
console.log('EMAIL_USER present:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASS present:', !!process.env.EMAIL_PASS);
console.log('RECEIVER_EMAIL present:', !!process.env.RECEIVER_EMAIL);
console.log('PORT:', process.env.PORT);
console.log('-------------------------');

// Configure Nodemailer transporter with explicit settings
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('Nodemailer verification error DETECTED:');
        console.error('- Message:', error.message);
        console.error('- Code:', error.code);
        console.error('- Command:', error.command);
    } else {
        console.log('✅ Success: Server is ready to take our messages');
    }
});

// Contact Route
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
            subject: `Portfolio Contact from ${name}: ${subject || 'New Message'}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            replyTo: email
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully from ${name}`);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email trace:');
        console.error('- Message:', error.message);
        console.error('- Code:', error.code);
        res.status(500).json({ success: false, error: 'Failed to send message. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
