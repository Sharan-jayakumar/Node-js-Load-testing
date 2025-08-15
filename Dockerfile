# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for npm start)
RUN npm ci

# Copy application source code
COPY . .

# Copy PM2 configuration
COPY ecosystem.config.js ./

# Create PM2 directory and logs directory
RUN mkdir -p /app/.pm2 /app/logs

# Expose the port the app runs on
EXPOSE 3000

# Start the application with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"] 