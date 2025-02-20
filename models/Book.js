const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: [{ type: String, required: true }],
    publishedYear: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    coverImage: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Индексы для быстрого поиска книг
BookSchema.index({ title: 'text', author: 'text', genre: 'text' });

module.exports = mongoose.model('Book', BookSchema);