# Node.js Load Testing Server

A comprehensive Express.js server setup with PostgreSQL database integration using Sequelize ORM, designed for load testing purposes.

## Project Structure

```
src/
├── config/          # Configuration files (database, app config)
├── controllers/     # Route controllers (date, task)
├── middlewares/     # Custom middleware (validation)
├── models/          # Data models (Task with Sequelize)
├── routes/          # API routes (date, task)
├── scripts/         # Database seeding scripts
├── services/        # Business logic
└── server.js        # Main server file
```

## Features

- **Express.js** web framework with security middleware
- **PostgreSQL** database with **Sequelize ORM**
- **Task Management API** with full CRUD operations
- **Date Calculation API** for time difference calculations
- **Docker** containerization with PostgreSQL
- **Load Testing Ready** - optimized for performance testing

## Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (via Docker)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

The application uses environment variables for configuration. For Docker deployment, these are set in `docker-compose.yml`:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=loadtesting
DB_USER=postgres
DB_PASSWORD=postgres123
```

### 3. Start the Application

#### Option A: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

#### Option B: Local Development

```bash
# Start the server with nodemon
npm run dev

# Start the server in production mode
npm start
```

## Database Setup

### PostgreSQL Database

The application automatically:

- Connects to PostgreSQL database
- Creates the `tasks` table if it doesn't exist
- Syncs all Sequelize models

### Task Table Schema

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### Seeding Data

Populate the database with sample tasks:

```bash
# Run the seeding script
npm run db:seed

# Or manually via Docker
docker exec -it node-load-testing-app node src/scripts/seedTasks.js
```

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Base API

- `GET /api` - API information and available endpoints

### Date Calculation API

- `GET /api/calculate-date?date=DD-MM-YYYY` - Calculate time difference from a given date
  - Example: `/api/calculate-date?date=05-03-2001`
  - Returns: years, months, days, hours, and minutes passed since the given date

### Task Management API

#### Get All Tasks

```bash
GET /api/tasks
```

#### Get Task by ID

```bash
GET /api/tasks/:id
```

#### Create New Task

```bash
POST /api/tasks
Content-Type: application/json

{
  "name": "Task Name",
  "description": "Task description",
  "isCompleted": false
}
```

#### Update Task

```bash
PUT /api/tasks/:id
Content-Type: application/json

{
  "name": "Updated Task Name",
  "description": "Updated description",
  "isCompleted": true
}
```

#### Delete Task (Soft Delete)

```bash
DELETE /api/tasks/:id
```

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server with nodemon for development
- `npm run db:seed` - Seed the database with sample tasks
- `npm test` - Run tests (placeholder)

## Docker Setup

### Quick Start with Docker Compose

1. **Build and run with Docker Compose:**

   ```bash
   # Build and start the container
   docker-compose up --build

   # Run in background
   docker-compose up -d --build

   # Stop the container
   docker-compose down
   ```

2. **Manual Docker commands:**

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
- **PostgreSQL integration** with persistent data

## Load Testing

This server is designed to be simple and lightweight for load testing purposes. You can use tools like:

- **Apache Bench (ab)**
- **Artillery**
- **k6** (see `k_6_load_testing_doc.md` for detailed setup)
- **JMeter**
- **LoadRunner**

### Recommended Test Endpoints

- `/health` - Lightweight health check
- `/api/tasks` - Database query endpoint
- `/api/calculate-date?date=01-01-2000` - CPU-intensive calculation

## Dependencies

### Production Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **dotenv** - Environment variables
- **express-validator** - Input validation
- **sequelize** - ORM for database operations
- **pg** - PostgreSQL client
- **pg-hstore** - PostgreSQL hstore support

### Development Dependencies

- **nodemon** - Development server with auto-reload

## Database Configuration

The application uses Sequelize ORM with the following features:

- **Connection pooling** for optimal performance
- **Automatic timestamps** (created_at, updated_at)
- **Soft deletes** (deleted_at) for data preservation
- **Snake_case** column naming convention
- **Retry logic** for database connection failures

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Ensure PostgreSQL container is running
   - Check environment variables in docker-compose.yml
   - Verify network connectivity between containers

2. **Port Already in Use**

   - Change PORT in environment or docker-compose.yml
   - Stop other services using port 3000

3. **Permission Denied**
   - Ensure Docker has proper permissions
   - Check file ownership in the project directory

### Logs and Debugging

```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres

# Access database directly
docker exec -it postgres-db psql -U postgres -d loadtesting
```
