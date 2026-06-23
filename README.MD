# Gymstructor Server

## Live API

🔗 https://gymstructor-server.vercel.app/api/classes

## Overview

Gymstructor Server is the backend API that powers the Gymstructor fitness platform. It handles authentication, authorization, user management, trainer applications, class management, bookings, payments, forum interactions, and dashboard operations. The server provides secure RESTful APIs and role-based access control to ensure safe and efficient data management.

## Key Features

- Secure JWT-based authentication and authorization.
- Role-based access control for Admin, Trainer, and Member.
- Trainer application review and approval system.
- Class creation, update, and management APIs.
- Booking and payment processing with JWT verification.
- Community forum APIs with voting, commenting, editing, and deletion functionality.
- Favorites management for saving preferred classes.
- Server-side search, filtering, and pagination support.
- Dashboard analytics and activity monitoring endpoints.
- MongoDB database integration for scalable data storage.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Token)
- Stripe Payment Gateway
- CORS
- Dotenv

## NPM Packages Used

- express
- mongodb
- jsonwebtoken
- stripe
- cors
- dotenv

## API Security

- JWT token verification for protected routes.
- Role-based middleware for authorization.
- Secure HTTP-only cookies for authentication.
- Environment variables for sensitive credentials.

## Author

Developed by Md Shafiul Azam
