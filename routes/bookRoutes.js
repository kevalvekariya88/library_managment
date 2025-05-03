const express = require("express");
const Book = require("../models/Book");
const fuzzysort = require("fuzzysort");
const router = express.Router();

// POST /books - insert one or many books based on request body type
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
router.get("/", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const books = await Book.find()
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  res.json(books);
});

// GET /search?q=
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
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    book ? res.json(book) : res.status(404).json({ error: "Not found" });
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// PUT /books/:id
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
