# SoleStride.

This eCommerce project is built using Node.js, Express, EJS, and MongoDB. It provides a platform for users to shop for products, manage their orders, and leave reviews. Administrators can manage products, categories, and users.

## Table of Contents

- [SoleStride.](#solestride)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Project Structure](#project-structure)
  - [Technologies](#technologies)

## Features

- User registration and authentication
- Product catalog and listings
- Shopping cart functionality
- Order history and management
- Product search and filtering
- User reviews and ratings
- Payment gateway integration
- Admin dashboard for managing products and categories
- User management with access control

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed
- MongoDB database set up
- Clone this repository

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ecommerce-project.git
   ```

2. Install dependencies:

   ```bash
   npm install / npm i
   ```

3. Set up your MongoDB connection in `.env`:

   ```env
   MONGODB_URI=your-mongodb-uri
   ```
4. Set up your Email connection for sending email using nodemailer in `.env` (I'm using BREVO for sending email you can use any email sending platform):

   ```env
   BREVO_PORT=587
   BREVO_MAIL=your-email
   BREVO_KEY=brevo-auth-key/your-email-password(unsafe)
   ```
5. Set a UUID or any string as secret in the `.env`:

   ```env
   SECRET=your-secret/uuid
   ```

6. Start the server:

   ```bash
   npm start
   ```

## Usage

- Access the application by opening your browser and navigating to `http://localhost:3000`.

> You can change the port by adding a `PORT` variable in the `.env` file to change the port
>> Example : `PORT=42069`    

## Project Structure

The project structure is organized as follows:

```bash
ecommerce-project/
├── public/             # Static assets
├── src/                # Source Folder
  ├── config/           # Configuration files
  ├── controllers/      # Request handlers
  ├── helpers/          # Helper functions
  ├── middlewares/      # Middleware functions
  ├── model/            # MongoDB models
  ├── routes/           # Express routes
  ├── validators/       # Express Validator Schemas
├── views/              # EJS views
├── .env                # Environment variables
├── app.js              # Express application setup
```

## Technologies

- Node.js
- Express
- EJS (Embedded JavaScript)
- MongoDB
- HTML, CSS, Bootstrap, JavaScript

