require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middlewares/errorHandler");

app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/books", bookRoutes);
app.use("/user", userRoutes);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
