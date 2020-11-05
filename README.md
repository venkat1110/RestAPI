# library-system-api

  A simple NodeJs REST API for Library Management System.

## Build with

* [Node.js](https://nodejs.org/en/)
* [Express.js](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/)
* [Mongoose.js](https://mongoosejs.com/)
* [Joi](https://www.npmjs.com/package/joi)
* [JWT](https://www.npmjs.com/package/jsonwebtoken)

## Features

* Create, Read, Update and Delete resource.
* Authentication
* Borrowing (book)
* Returning (book)

This API can only be used locally where the users (librarian, employee, staff) handles everything. Then the borrowers (customers, students) will only do is to borrow and return the book to the users.

## Installation

To get started, run this in your terminal: 

```
> git clone https://github.com/rmasianjr/library-system-api.git
> cd library-system-api
> npm install
```

In the root of the project create _.env_ file, and supply the following:

```
DATABASE=your-mongo-url
DATABASE_TEST=your-mongo-url-test
SECRET=your-secret
PORT_TEST=3001
```

To start the app, simply run: 

```
> npm start
```

## Accessing the API

Base URL:

dev: <http://localhost:3000> <br>
prod: <https://library-system-api.herokuapp.com>

### **Categories**

POST, PUT and DELETE requires authentication (auth token)

|METHOD| ENDPOINT| USAGE| RETURNS|
|:-----|:--------|:-----|:-------|
|GET| /api/categories| Get all Categories| List of Categories
|GET| /api/categories/{id}| Get an Category| Single Category
|POST| /api/categories| Create Category| Created Category
|PUT| /api/categories/{id}| Update Category| Updated Category
|DELETE| /api/categories/{id}| Delete Category| Deleted Category

### **Books**

POST, PUT and DELETE requires authentication (auth token)

|METHOD| ENDPOINT| USAGE| RETURNS|
|:-----|:--------|:-----|:-------|
|GET| /api/books| Get all Books| List of Books
|GET| /api/books/{id}| Get an Book| Single Book
|POST| /api/books| Create Book| Created Book
|PUT| /api/books/{id}| Update Book| Updated Book
|DELETE| /api/books/{id}| Delete Book| Deleted Book

### **Borrowers**

requires authentication (auth token)

|METHOD| ENDPOINT| USAGE| RETURNS|
|:-----|:--------|:-----|:-------|
|GET| /api/borrowers| Get all Borrowers| List of Borrowers
|GET| /api/borrowers/{id}| Get an Borrower| Single Borrower
|POST| /api/borrowers| Create Borrower| Created Borrower
|PUT| /api/borrowers/{id}| Update Borrower| Updated Borrower
|DELETE| /api/borrowers/{id}| Delete Borrower| Deleted Borrower

### **Borrows**

requires authentication (auth token)

|METHOD| ENDPOINT| USAGE| RETURNS|
|:-----|:--------|:-----|:-------|
|GET| /api/borrows| Get all Borrows| List of Borrows
|GET| /api/borrows/{id}| Get an Borrow| Single Borrow
|POST| /api/borrows| Create Borrow transaction| Created Borrow transaction

### **Returns**

requires authentication (auth token)

|METHOD| ENDPOINT| USAGE| RETURNS|
|:-----|:--------|:-----|:-------|
|POST| /api/returns| Return the borrowed book | Borrow transaction with return date and fee

### **Users**

GET requires authentication (auth token)

|METHOD| ENDPOINT| USAGE| RETURNS|
|:-----|:--------|:-----|:-------|
|POST| /api/users| Register a User| A User data, auth token in response header
|GET| /api/users/me| Get current User| Current User data

### **Authentication**

|METHOD| ENDPOINT| USAGE| RETURNS|
|:-----|:--------|:-----|:-------|
|POST| /api/auth| Login a User| A User data, auth token in response header


## Testing

To test the api, you can use [Postman](https://www.getpostman.com/) or simply run: 

```
> npm run test
```

## Author

[Ricardo Masian Jr.](https://github.com/rmasianjr)