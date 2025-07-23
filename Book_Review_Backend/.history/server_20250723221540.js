require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
console.log("MONGO_URL:", process.env.MONGO_URL);


const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const reviewRoutes = require("./routes/reviews");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reviews", reviewRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


