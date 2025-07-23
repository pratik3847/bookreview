const express = require('express');
const Book = require('../models/Book');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, author } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (genre) filter.genre = new RegExp(genre, 'i');
    if (author) filter.author = new RegExp(author, 'i');

    const books = await Book.find(filter)
      .populate('addedBy', 'username')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(filter);

    res.json({
      books,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBooks: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'username');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, author, genre } = req.body;
    if (!title || !author || !genre) return res.status(400).json({ message: 'All fields are required' });

    const existingBook = await Book.findOne({ title: title.trim(), author: author.trim() });
    if (existingBook) return res.status(400).json({ message: 'This book already exists' });

    const book = new Book({
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      addedBy: req.user._id
    });

    await book.save();
    await book.populate('addedBy', 'username');

    res.status(201).json({ message: 'Book added successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
