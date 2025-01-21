const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

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
// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Using JSON.stringify to format the response neatly
  const bookList = JSON.stringify(books, null, 2);
  return res.status(200).send(bookList);
});

// Get book details based on ISBN

 public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve the ISBN from request parameters
  const book = books[isbn]; // Access the book details using the ISBN as a key

  if (book) {
      return res.status(200).json(book); // Return the book details if found
  } else {
      return res.status(404).json({ message: "Book not found" }); // Return an error if the book is not found
  }
});
// Get book details based on author
// Get book details based on the author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author; // Retrieve the author from request parameters
  const booksByAuthor = [];

  // Iterate through the books object to find books by the given author
  for (const key in books) {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
          booksByAuthor.push(books[key]);
      }
  }

  if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor); // Return the list of books by the author
  } else {
      return res.status(404).json({ message: "No books found for the given author" }); // Return an error if no books are found
  }
});

// Get all books based on title
// Get all books based on the title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title; // Retrieve the title from request parameters
  const booksByTitle = [];

  // Iterate through the books object to find books with the given title
  for (const key in books) {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
          booksByTitle.push(books[key]);
      }
  }

  if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle); // Return the list of books matching the title
  } else {
      return res.status(404).json({ message: "No books found with the given title" }); // Return an error if no books are found
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
