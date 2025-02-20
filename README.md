# **Book Recommendation API**

## **Overview**
Book Recommendation API is a scalable and secure RESTful API that allows users to browse books, submit reviews, and receive recommendations. The system is built with **Node.js, Express, and MongoDB**, utilizing **aggregation, indexing, and sharding** for performance optimization.

## **Features**
User authentication with JWT and bcrypt password hashing  
Role-Based Access Control (RBAC) for admins and users  
CRUD operations for books, reviews, and user management  
Aggregation pipelines for data analysis (ratings, top reviewers, etc.)  
Sharding for horizontal scaling and performance improvement  
Audit logging with Winston for tracking admin actions  
Real-time updates using MongoDB Change Streams  

---

## **Installation & Setup**

### **1. Clone the Repository**
```sh
git clone https://github.com/1ncogn1to0/book-recommendation-api.git
cd book-recommendation-api
```

### **2. Install Dependencies**
```sh
npm install
```

### **3. Configure Environment Variables**
Create a `.env` file and add the following:
```env
MONGO_URI=mongodb://localhost:27017/book-recommendation
JWT_SECRET=your_secret_key
PORT=5000
```

### **4. Start the Server**
```sh
npm start
```

---

## **API Endpoints**

### **Authentication**
**Register a User:** `POST /api/users/register`
```json
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "password123"
}
```

**Login a User:** `POST /api/users/login`
```json
{
  "email": "user1@example.com",
  "password": "password123"
}
```

---

### **Books**
**Add a Book (Admin Only):** `POST /api/books`
```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "genre": "Sci-Fi",
  "publishedYear": 1965
}
```

**Get All Books:** `GET /api/books`

**Search Books:** `GET /api/books/search?query=Dune`

**Delete a Book (Admin Only):** `DELETE /api/books/:bookId`

---

### **Reviews**
**Submit a Review:** `POST /api/reviews`
```json
{
  "bookId": "65a6b1c4561d4f0c4b3f1e11",
  "rating": 5,
  "comment": "Amazing book!"
}
```

**Delete a Review:** `DELETE /api/reviews/:reviewId`

---

### **Bulk Operations**
**Bulk Insert Books:** `POST /api/books/bulk-insert`
```json
{
  "books": [
    { "title": "Book 1", "author": "Author A", "genre": "Horror", "publishedYear": 2000 },
    { "title": "Book 2", "author": "Author B", "genre": "Sci-Fi", "publishedYear": 2015 }
  ]
}
```

**Bulk Delete Books:** `DELETE /api/books/bulk-delete`
```json
{
  "bookIds": ["65a6b1c4561d4f0c4b3f1e11", "65a6b1c4561d4f0c4b3f1e12"]
}
```

---

## **Security & Optimization**
### **RBAC (Role-Based Access Control)**
- **Users** can search books, submit reviews.
- **Admins** can add/remove books, manage users.

### **Indexing for Faster Queries**
```sh
db.books.createIndex({ "title": "text", "author": "text" })
```

### **Sharding for Scalability**
```sh
sh.enableSharding("book-recommendation")
sh.shardCollection("book-recommendation.books", { genre: "hashed" })
```

### **Audit Logging with Winston**
```javascript
logger.info(`Admin ${req.user.id} deleted book ${req.params.bookId}`);
```

---

## **Contributing**
1. Fork the repository  
2. Create a new feature branch  
3. Commit changes  
4. Push to GitHub and create a pull request  

---

## **License**
This project is licensed under the **MIT License**.

**Author:** [1ncogn1to0](https://github.com/1ncogn1to0)

