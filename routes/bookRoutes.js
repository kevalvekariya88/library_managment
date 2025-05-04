const express = require("express");
const Book = require("../models/Book");
const fuzzysort = require("fuzzysort");
const router = express.Router();

// POST /books - insert one or many books based on request body type

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add a single book or bulk insert books
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/Book'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book(s) added successfully
 *       400:
 *         description: Invalid input
 *       413:
 *         description: Too many books in bulk request
 */
router.post("/", async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      if (req.body.length === 0) {
        return res.status(400).json({ error: "Empty array not allowed." });
      }

      // Optional: bulk insert limit
      if (req.body.length > 20) {
        return res
          .status(413)
          .json({ error: "Max 20 books allowed in one bulk request." });
      }

      const books = await Book.insertMany(req.body);
      return res
        .status(201)
        .json({ message: "Books added successfully", data: books });
    } else {
      const book = new Book(req.body);
      const saved = await book.save();
      return res
        .status(201)
        .json({ message: "Book added successfully", data: saved });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /books

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books with pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *     responses:
 *       200:
 *         description: List of books
 */
router.get("/", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const books = await Book.find()
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  res.json(books);
});

// GET /search?q=

/**
 * @swagger
 * /books/search:
 *   get:
 *     summary: Fuzzy search for books by title, author, or genre
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of matched books
 *       400:
 *         description: Missing query parameter
 *       404:
 *         description: No matches found
 */
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q)
      return res.status(400).json({ error: 'Query param "q" is required' });

    const regex = new RegExp(q.split("").join(".*"), "i");
    const books = await Book.find({
      $or: [
        { title: { $regex: regex } },
        { author: { $regex: regex } },
        { genre: { $regex: regex } },
      ],
    });

    if (!books.length) {
      return res.status(404).json({ message: "No matching books found" });
    }

    // Step 2: Fuzzysort in-memory
    const results = fuzzysort.go(q, books, {
      keys: ["title", "author", "genre"],
      limit: 20,
      threshold: -1000,
    });

    res.status(200).json({ results: results.map((r) => r.obj) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /books/:id

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book found
 *       404:
 *         description: Not found
 *       400:
 *         description: Invalid ID
 */
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    book ? res.json(book) : res.status(404).json({ error: "Not found" });
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// PUT /books/:id

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated
 *       404:
 *         description: Not found
 *       400:
 *         description: Invalid ID
 */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    updated ? res.json(updated) : res.status(404).json({ error: "Not found" });
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// DELETE /books/:id

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted
 *       404:
 *         description: Not found
 *       400:
 *         description: Invalid ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    deleted
      ? res.json({ message: "Deleted" })
      : res.status(404).json({ error: "Not found" });
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

module.exports = router;
