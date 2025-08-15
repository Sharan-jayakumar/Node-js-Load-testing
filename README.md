# Node.js Load Testing Server

A comprehensive Express.js server setup with **PM2 process manager**, PostgreSQL database integration using Sequelize ORM, and Docker containerization, designed for load testing purposes with optimized resource allocation.

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
ecosystem.config.js  # PM2 configuration for cluster mode
docker-compose.yml   # Multi-container setup with resource limits
Dockerfile          # PM2-enabled container configuration
```

## Features

- **Express.js** web framework with security middleware
- **PM2 Process Manager** with cluster mode for load balancing
- **PostgreSQL** database with **Sequelize ORM**
- **Task Management API** with full CRUD operations
- **Date Calculation API** for time difference calculations
- **Docker** containerization with PostgreSQL and resource management
- **Load Testing Ready** - optimized for performance testing with 2 cores and 4GB RAM

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
PM2_HOME=/app/.pm2

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

# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres

# Stop services
docker-compose down
```

#### Option B: Local Development

```bash
# Start the server with PM2 in development mode
npm run dev

# Start the server with PM2 in production mode
npm start

# View PM2 logs
npm run logs

# Monitor PM2 processes
npm run monit
```

## PM2 Configuration

### Cluster Mode Setup

The application runs with **PM2 cluster mode** for optimal performance:

- **2 Node.js instances** (1 per CPU core)
- **Automatic load balancing** across instances
- **Process monitoring** and auto-restart
- **Centralized logging** for all instances

### PM2 Management Commands

```bash
# Start PM2 processes
npm start

# Stop PM2 processes
npm run stop

# Restart PM2 processes
npm run restart

# Delete PM2 processes
npm run delete

# View PM2 logs
npm run logs

# Monitor PM2 processes
npm run monit
```

### PM2 Configuration File

The `ecosystem.config.js` file configures:

- **Cluster mode** with 2 instances
- **Memory management** with restart limits
- **Logging** to separate files
- **Process reliability** settings

## Docker Setup

### Multi-Container Architecture

The setup includes two containers with resource management:

1. **Node.js App Container** (with PM2)

   - **CPU**: 2 cores
   - **Memory**: 4GB
   - **Port**: 3000

2. **PostgreSQL Database Container**
   - **CPU**: 1 core
   - **Memory**: 2GB
   - **Port**: 5432

### Quick Start with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop all services
docker-compose down

# View resource usage
docker stats
```

### Docker Features

- **PM2 integration** for process management
- **Resource limits** for predictable performance
- **Persistent PostgreSQL data** with volumes
- **Network isolation** between containers
- **Environment variable** support
- **Health monitoring** capabilities

## Database Setup

### PostgreSQL Database

The application automatically:

- Connects to PostgreSQL database
- Creates the `tasks` table if it doesn't exist
- Syncs all Sequelize models
- Handles connection retries and failures

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

- `npm start` - Start the server with PM2
- `npm run dev` - Start the server with PM2 in development mode
- `npm run stop` - Stop PM2 processes
- `npm run restart` - Restart PM2 processes
- `npm run delete` - Delete PM2 processes
- `npm run logs` - View PM2 logs
- `npm run monit` - Monitor PM2 processes
- `npm run db:seed` - Seed the database with sample tasks

## Load Testing

This server is optimized for load testing with PM2 cluster mode and Docker resource management:

### Resource Allocation

- **2 CPU cores** for Node.js processes
- **4GB RAM** for application and PM2
- **2 PM2 instances** for load distribution

### Recommended Test Endpoints

- `/health` - Lightweight health check (PM2 load balanced)
- `/api/tasks` - Database query endpoint (PM2 load balanced)
- `/api/calculate-date?date=01-01-2000` - CPU-intensive calculation (PM2 load balanced)

### Load Testing Tools

- **k6** (see `k_6_load_testing_doc.md` for detailed setup)
- **Apache Bench (ab)**
- **Artillery**
- **JMeter**
- **LoadRunner**

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
- **PM2 integration** for process management

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Ensure PostgreSQL container is running
   - Check environment variables in docker-compose.yml
   - Verify network connectivity between containers

2. **PM2 Process Issues**

   - Check PM2 logs: `npm run logs`
   - Monitor processes: `npm run monit`
   - Restart processes: `npm run restart`

3. **Port Already in Use**

   - Change PORT in environment or docker-compose.yml
   - Stop other services using port 3000

4. **Resource Limits**

   - Monitor container resources: `docker stats`
   - Adjust CPU/memory limits in docker-compose.yml

### Logs and Debugging

```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres

# View PM2 logs
npm run logs

# Monitor PM2 processes
npm run monit

# Access database directly
docker exec -it postgres-db psql -U postgres -d loadtesting

# Check container resources
docker stats node-load-testing-app postgres-db
```

### PM2 Troubleshooting

```bash
# Check PM2 status
docker exec -it node-load-testing-app pm2 status

# View PM2 logs
docker exec -it node-load-testing-app pm2 logs

# Restart PM2 processes
docker exec -it node-load-testing-app pm2 restart all

# Delete and restart PM2 processes
docker exec -it node-load-testing-app pm2 delete all && pm2 start ecosystem.config.js
```
