require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./middleware/logger');

const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

console.log("🚀 Starting server...");

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Подключение к MongoDB
console.log("🔄 Connecting to MongoDB...");
mongoose.connect('mongodb://127.0.0.1:27017/book-recommendation')

    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1); // Завершаем процесс при ошибке
    });

// API маршруты
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});


// Запуск сервера
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
