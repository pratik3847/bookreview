const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  author: { type: String, required: true, trim: true, maxlength: 100 },
  genre: { type: String, required: true, trim: true, maxlength: 50 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

bookSchema.index({ genre: 1, author: 1 });

module.exports = mongoose.model('Book', bookSchema);
