const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Registered users array

// Check if the username is valid (non-empty and unique)
const isValid = (username) => {
    return username && !users.find(user => user.username === username);
};

// Authenticate the user by verifying the username and password
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Validate username and password
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check authentication
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, "secretKey", { expiresIn: "1h" });

    return res.status(200).json({ message: "Login successful.", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;

    // Extract username from token (assuming middleware has verified token)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access. Please log in." });
    }

    const decoded = jwt.verify(token, "secretKey");
    const username = decoded.username;

    // Validate the review
    if (!review) {
        return res.status(400).json({ message: "Review content is required." });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Add or update the review for the user
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully.", reviews: books[isbn].reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;

    // Extract username from token (assuming middleware has verified token)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access. Please log in." });
    }

    const decoded = jwt.verify(token, "secretKey");
    const username = decoded.username;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Delete the user's review
    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully.", reviews: books[isbn].reviews });
    } else {
        return res.status(404).json({ message: "No review found for the user on this book." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
