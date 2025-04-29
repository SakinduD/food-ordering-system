# Food Ordering System

A modern, scalable, microservices-based food ordering and delivery platform for Sri Lanka. This system enables customers to browse restaurants, order food, track deliveries in real-time, and manage their profiles. It is built with a React frontend, Node.js/Express backend, and leverages Docker for containerized deployment.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Microservices Overview](#microservices-overview)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the System](#running-the-system)
- [Development & Deployment](#development--deployment)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Features
- Customer registration, login, and profile management
- Restaurant registration, menu management, and order processing
- Real-time order tracking and delivery assignment
- Secure JWT-based authentication and Google OAuth
- Admin dashboard for user/restaurant management
- Email notifications and SMS alerts
- Payment integration
- Responsive web frontend (React + Vite)
- Microservices architecture with API Gateway
- Dockerized for easy deployment

## Architecture
- **Frontend:** React (Vite), Tailwind CSS, Nginx (for static serving)
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB (cloud-hosted via MongoDB Atlas)
- **Microservices:** Each core domain (auth, restaurant, menu, order, delivery, payment, notification) is a separate service
- **API Gateway:** Central entry point for all client/backend communication
- **Containerization:** Docker & Docker Compose for local development and deployment
- **Orchestration:** Kubernetes manifests provided for production

## Technologies Used
- React, Vite, Tailwind CSS
- Node.js, Express, TypeScript
- MongoDB, Mongoose
- Docker, Docker Compose
- Nginx
- JWT, Passport.js, Google OAuth
- Nodemailer, Twilio (for notifications)
- Socket.io (for real-time delivery tracking)

## Microservices Overview
- **Client:** React SPA for customers, restaurants, and admins
- **API Gateway:** Proxies and secures all API traffic
- **Auth Service:** User authentication, registration, JWT, Google OAuth
- **Restaurant Service:** Restaurant registration, profile, and management
- **Menu Service:** Menu CRUD, image upload, menu search
- **Order Service:** Order placement, status, and summary
- **Delivery Service:** Delivery assignment, driver tracking, real-time updates
- **Payment Service:** Payment processing and integration
- **Notification Service:** Email and SMS notifications

## Setup & Installation

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (for local development)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or use provided connection strings)

### Clone the Repository
```sh
git clone <your-repo-url>
cd food-ordering-system
```

### Environment Variables
Each service requires its own `.env` file. See the `.env` examples in each service folder. At minimum, set:
- `MONGO_URI` (MongoDB connection string)
- `JWT_SECRET` (JWT signing key)
- `EMAIL_USER`, `EMAIL_PASS` (for notifications)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (for Google OAuth)
- Service URLs (see `docker-compose.yml` for defaults)

### Build & Run with Docker Compose
```sh
docker-compose up --build
```
- The client will be available at [http://localhost:3000](http://localhost:3000)
- API Gateway at [http://localhost:5007](http://localhost:5007)
- Each microservice on its respective port (see `docker-compose.yml`)

### For Windows Users
You can use the provided PowerShell script for deployment:
```sh
./run-deploy.ps1
```

## Development & Deployment
- Each service can be developed and run independently
- For production, use the provided Kubernetes manifests in each service folder
- Static frontend is served via Nginx

## API Endpoints
- All API requests should go through the API Gateway (`/api/...`)
- See each service's `src/routes` for detailed endpoints

---

