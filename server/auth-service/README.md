# Auth Service

This is the authentication service for a microservices-based application. It is built using TypeScript and provides user authentication and authorization functionalities.

## Features
- User authentication (login, signup, logout)
- JWT-based authentication
- Google OAuth integration
- Email verification and password reset

## Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB** (Mongoose ORM)
- **JWT (JSON Web Token)**
- **TypeScript**
- **Nodemailer** (for email services)

## Installation

1. Clone the repository:
   ```sh
   git clone <repository_url>
   ```

2. Navigate to the `auth-service` directory:
   ```sh
   cd auth-service
   ```

3. Install dependencies:
   ```sh
   npm install
   ```

4. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   MONGO_URI=<your_mongo_database_uri>
   JWT_SECRET=<your_jwt_secret>
   EMAIL_USER=<your_email_user>
   EMAIL_PASS=<your_email_password>
   PORT=5000
   GOOGLE_CLIENT_ID=<your_google_client_id>
   GOOGLE_CLIENT_SECRET=<your_google_client_secret>
   ```

## Running the Project

Start the development server:
   ```sh
   npm run dev
   ```

The service will run on `http://localhost:5000` by default.

## API Endpoints

- **`POST /api/auth/register`** - User registration
- **`POST /api/auth/login`** - User login
- **`POST /api/auth/logout`** - User logout
- **`POST /api/auth/google`** - Google OAuth authentication
- **`POST /api/auth/forgot-password`** - Request password reset email
- **`POST /api/auth/reset-password`** - Reset password with token

## License
This project is licensed under the MIT License.

