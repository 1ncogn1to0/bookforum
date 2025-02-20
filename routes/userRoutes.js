const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Получение списка всех пользователей (только для админа)
router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Получение информации о пользователе
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Если роль не указана или пользователь не admin, назначаем "user"
        const userRole = role && role === "admin" ? "admin" : "user";

        user = new User({ username, email, password, role: userRole });
        await user.save();

        res.status(201).json({ message: 'User registered successfully', role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Логин пользователя
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удаление пользователя (только админ)
router.delete('/:userId', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(req.params.userId);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});












// Получить список избранных книг пользователя
router.get('/favorites', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('favoriteBooks');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.favoriteBooks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/favorite/:bookId', authMiddleware, async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.user.id },
            { $push: { favoriteBooks: req.params.bookId } } // 📌 Добавляем книгу
        );
        res.json({ message: "Book added to favorites" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/favorite/:bookId', authMiddleware, async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.user.id },
            { $pull: { favoriteBooks: req.params.bookId } } // 📌 Удаляем книгу
        );
        res.json({ message: "Book removed from favorites" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});






router.get('/bucket/reviews', async (req, res) => {
    try {
        const users = await Review.aggregate([
            { $group: { _id: "$userId", reviewCount: { $sum: 1 } } },
            { $bucket: {
                groupBy: "$reviewCount",
                boundaries: [1, 5, 10, 20], // 📌 Категории: 1-4, 5-9, 10-19, 20+
                default: "20+ reviews",
                output: { users: { $push: "$_id" }, count: { $sum: 1 } }
            }}
        ]);

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;