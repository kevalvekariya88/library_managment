# 📚 Library Management API

A backend API built with **Node.js**, **Express**, and **MongoDB** to manage a library's book inventory. It supports CRUD operations and search functionality.

---

## 🚀 Features

- Add, update, delete books
- Search books by title, author, or genre
- Retrieve all books
- MongoDB Atlas integration
- Modular code structure with middleware and models

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

---

## 📁 Folder Structure

```
library_management/
├── middleware/
│   └── logger.js
├── models/
│   └── book.js
├── routes/
│   └── books.js
├── index.js
├── package.json
└── .gitignore
```

---

## 📦 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/kevalvekariya88/library_managment.git
   cd library_managment
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add your MongoDB connection string:

   ```env
   MONGO_URI=your_mongodb_connection_string
   ```

---

## 🧪 Running the Application

- **Start the server:**

  ```bash
  node index.js
  ```

  The server will run on `http://localhost:3000`.

---

## 📡 API Endpoints

### ➕ Add a New Book

- **URL:** `POST /books`
- **Body:**

  ```json
  {
    "title": "Book Title",
    "author": "Author Name",
    "genre": "Genre",
    "year": 2021,
    "ISBN": "1234567890",
    "stockCount": 5
  }
  ```

### 📚 Get All Books

- **URL:** `GET /books`

### 🔍 Search Books

- **URL:** `GET /books/search?q=searchTerm`

### 📘 Get Book by ID

- **URL:** `GET /books/:id`

### ✏️ Update Book

- **URL:** `PUT /books/:id`
- **Body:** (Fields to update)

### ❌ Delete Book

- **URL:** `DELETE /books/:id`

---
