# Node.js Load Testing Server

A basic Express.js server setup for load testing purposes.

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middlewares/     # Custom middleware
├── models/          # Data models
├── routes/          # API routes
├── services/        # Business logic
└── server.js        # Main server file
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:

   ```bash
   PORT=3000
   NODE_ENV=development
   ```

3. Start the server:

   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server with nodemon for development
- `npm test` - Run tests (placeholder)

## Docker Setup

### Quick Start with Docker Compose

1. Build and run with Docker Compose:
   ```bash
   # Build and start the container
   docker-compose up --build
   
   # Run in background
   docker-compose up -d --build
   
   # Stop the container
   docker-compose down
   ```

2. Manual Docker commands:
   ```bash
   # Build the image
   docker build -t node-load-testing .
   
   # Run the container
   docker run -p 3000:3000 --env-file .env node-load-testing
   ```

### Docker Features

- **Multi-stage build** for optimized image size
- **Non-root user** for security
- **Health checks** for container monitoring
- **Environment variable** support
- **Port mapping** (3000:3000)

## API Endpoints

- `GET /health` - Health check
- `GET /api` - API information
- `GET /api/calculate-date?date=DD-MM-YYYY` - Calculate time difference from a given date
  - Example: `/api/calculate-date?date=05-03-2001`
  - Returns: years, months, days, hours, and minutes passed since the given date

## Load Testing

This server is designed to be simple and lightweight for load testing purposes. You can use tools like:

- Apache Bench (ab)
- Artillery
- k6
- JMeter
- LoadRunner

## Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **dotenv** - Environment variables
- **express-validator** - Input validation
- **nodemon** - Development server (dev dependency)
