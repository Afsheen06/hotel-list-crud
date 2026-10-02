require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const hotelsRouter = require('./src/routes/hotels');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded hotel images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/hotels', hotelsRouter);

// Multer / general error handler (e.g. bad file type, file too large)
app.use((err, req, res, next) => {
  if (err) {
    console.error(err.message);
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Serve the React production build and support direct detail-page links.
if (process.env.NODE_ENV === 'production') {
  const frontendDir = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
    res.sendFile(path.join(frontendDir, 'index.html'));
  });
}

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Hotel backend running on http://localhost:${PORT}`);
});
