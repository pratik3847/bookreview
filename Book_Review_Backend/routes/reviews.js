const express = require('express');
const Review = require('../models/Review');
const Book = require('../models/Book');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/book/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { bookId, reviewText, rating } = req.body;
    if (!bookId || !reviewText || !rating) return res.status(400).json({ message: 'All fields required' });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const existingReview = await Review.findOne({ bookId, userId: req.user._id });
    if (existingReview) return res.status(400).json({ message: 'Already reviewed' });

    const review = new Review({
      bookId,
      userId: req.user._id,
      reviewText: reviewText.trim(),
      rating: parseInt(rating)
    });

    await review.save();
    await review.populate('userId', 'username');

    await updateBookRating(bookId);

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

async function updateBookRating(bookId) {
  const reviews = await Review.find({ bookId });
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  await Book.findByIdAndUpdate(bookId, {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews
  });
}

module.exports = router;
