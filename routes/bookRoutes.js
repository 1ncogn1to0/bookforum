const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Review = require('../models/Review');
const logger = require('../middleware/logger');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Добавить книгу (только для админа)
router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    const { title, author, genre, publishedYear, coverImage } = req.body;
    try {
        const newBook = new Book({ title, author, genre, publishedYear, coverImage });
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Поиск книг по ключевому слову
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const books = await Book.find({ $text: { $search: query } });
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Получить все книги
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удаление книги (только админ)
router.delete('/:bookId', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        await Book.findByIdAndDelete(req.params.bookId);
        res.json({ message: "Book deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});










router.get('/stats', async (req, res) => {
    try {
        const stats = await Review.aggregate([
            { $group: { _id: "$bookId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
            { $sort: { avgRating: -1 } }
        ]);

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});












router.post('/bulk-insert', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { books } = req.body;

        const result = await Book.bulkWrite(
            books.map(book => ({
                insertOne: { document: book }
            }))
        );

        res.json({ message: "Books inserted successfully", insertedCount: result.insertedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.put('/bulk-update-genre', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { genre, newGenre } = req.body;

        const result = await Book.bulkWrite([
            {
                updateMany: {
                    filter: { genre: genre }, // 📌 Ищем книги по старому жанру
                    update: { $set: { genre: newGenre } } // 📌 Меняем на новый
                }
            }
        ]);

        res.json({ message: "Books updated successfully", modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;