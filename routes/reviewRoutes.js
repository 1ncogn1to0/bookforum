const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Book = require('../models/Book');
const authMiddleware = require('../middleware/authMiddleware');

// Добавить отзыв к книге
router.post('/', authMiddleware, async (req, res) => {
    const { bookId, rating, comment } = req.body;
    try {
        const review = new Review({ userId: req.user.id, bookId, rating, comment });
        await review.save();

        // Обновляем рейтинг книги
        const book = await Book.findById(bookId);
        book.reviews.push(review._id);
        const allReviews = await Review.find({ bookId });
        book.rating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
        await book.save();

        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получить отзывы для книги
router.get('/:bookId', async (req, res) => {
    try {
        const reviews = await Review.find({ bookId: req.params.bookId }).populate('userId', 'username');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удаление отзыва и обновление рейтинга книги
router.delete('/:reviewId', authMiddleware, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const bookId = review.bookId;

        // Удаляем отзыв
        await Review.findByIdAndDelete(req.params.reviewId);

        // Удаляем ID отзыва из массива книги
        await Book.updateOne(
            { _id: bookId },
            { $pull: { reviews: review._id } }
        );

        // Пересчитываем средний рейтинг книги
        const allReviews = await Review.find({ bookId });
        const newRating = allReviews.length > 0
            ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
            : 0; // Если отзывов больше нет, ставим рейтинг 0

        await Book.updateOne({ _id: bookId }, { rating: newRating });

        res.json({ message: "Review deleted successfully", newRating });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




router.get('/book/:bookId/reviews', async (req, res) => {
    try {
        const reviews = await Review.aggregate([
            { $match: { bookId: new mongoose.Types.ObjectId(req.params.bookId) } },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" }, // 📌 Разворачиваем массив пользователей
            { $project: { "user.password": 0, "user.email": 0 } } // 📌 Убираем лишние данные
        ]);

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;