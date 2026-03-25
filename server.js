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

// Configure Nodemailer transporter with pooling and longer timeouts
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use STARTTLS
    pool: true,    // keep connections open
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 30000,
    tls: {
        rejectUnauthorized: false
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Nodemailer verification error:');
        console.error('- Message:', error.message);
        console.error('- Code:', error.code);
    } else {
        console.log('✅ Success: SMTP Server is connected and ready');
    }
});

// Contact Route
app.post('/api/contact', async (req, res) => {
    console.log('📩 Incoming contact request from:', req.body.email);
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
        console.log(`✅ Email sent successfully to inbox for ${name}`);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('❌ Error sending email trace:');
        console.error('- Message:', error.message);
        console.error('- Code:', error.code);
        res.status(500).json({ success: false, error: `Server Error: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
