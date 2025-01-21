const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


const axios = require('axios');


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the username already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists. Please choose a different username." });
  }

  // Add the new user to the users array
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully." });
});
// Get the book list available in the shop using async/await
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/books');
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list." });
  }
});


public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const book = books[isbn];
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details." });
  }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const booksByAuthor = Object.values(books).filter(
      book => book.author.toLowerCase() === author.toLowerCase()
    );

    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res.status(404).json({ message: "No books found for the given author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author." });
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const booksByTitle = Object.values(books).filter(
      book => book.title.toLowerCase() === title.toLowerCase()
    );

    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      return res.status(404).json({ message: "No books found with the given title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title." });
  }
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve the ISBN from request parameters
  const book = books[isbn]; // Access the book details using the ISBN as a key

  if (book) {
      return res.status(200).json(book.reviews); // Return the reviews of the book
  } else {
      return res.status(404).json({ message: "Book not found" }); // Return an error if the book is not found
  }
});


module.exports.general = public_users;
