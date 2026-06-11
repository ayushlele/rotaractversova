const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '.')));

const MESSAGES_FILE = path.join(__dirname, 'messages.json');
const VOLUNTEERS_FILE = path.join(__dirname, 'volunteers.json');

// Helper to ensure files exist
const ensureFile = (file) => {
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
};
ensureFile(MESSAGES_FILE);
ensureFile(VOLUNTEERS_FILE);

// --- API ENDPOINTS ---

app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });

    const entries = JSON.parse(fs.readFileSync(MESSAGES_FILE));
    entries.push({ id: Date.now(), type: 'contact', name, email, subject, message, date: new Date().toISOString() });
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(entries, null, 2));

    res.json({ success: true });
});

app.post('/api/volunteer', (req, res) => {
    const { name, email, phone, age, profession, why_join, area } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ error: 'Missing required fields' });

    const entries = JSON.parse(fs.readFileSync(VOLUNTEERS_FILE));
    entries.push({ id: Date.now(), type: 'volunteer', name, email, phone, age, profession, why_join, area, date: new Date().toISOString() });
    fs.writeFileSync(VOLUNTEERS_FILE, JSON.stringify(entries, null, 2));

    res.json({ success: true });
});

// Simple Auth for Admin
app.post('/api/auth', (req, res) => {
    const { password } = req.body;
    if (password === 'paarthisgay') {
        res.json({ success: true, token: 'authenticated' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
    }
});

// Fetch messages (protected)
app.get('/api/admin/data', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer authenticated') return res.status(401).json({ error: 'Unauthorized' });

    const contacts = JSON.parse(fs.readFileSync(MESSAGES_FILE));
    const volunteers = JSON.parse(fs.readFileSync(VOLUNTEERS_FILE));

    res.json({ contacts, volunteers });
});

// Fallback for HTML routing (like Vercel/Netlify)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
